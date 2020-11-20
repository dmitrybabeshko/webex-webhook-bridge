const Webex = require('webex');
const {Kafka} = require('kafkajs')
const http = require('http');
const {fonts} = require('./fonts');


let webex;
let kafka;
let kafkaProducer;
let runningListeners = 0;


function verifyAccessToken(accessToken) {
    _initializeWebex(accessToken);

    return new Promise((resolve, reject) => {

        webex.people.get('me').then(person => {
            resolve(person);
        }).catch(() => {
                reject('not authenticated');
            }
        );
    });
}

function runListener(config, resource) {
    const event = config.selection.event;
    const resource_object = resource;

    if (config.kafka.enabled) {
        _initializeKafka(config);
    }

    _startListener(config, resource, event);
    process.on('SIGINT', () => {
        _stopListener(resource_object, event);

        if (runningListeners === 0) {
            process.exit(0);
        }
    });
}

function _initializeWebex(accessToken) {
    webex = Webex.init({
        credentials: {
            access_token: accessToken
        }
    });
}

function _initializeKafka(config) {
    kafka = new Kafka({
        clientId: config.kafka.clientId,
        brokers: config.kafka.brokers
    })
    kafkaProducer = kafka.producer();
}

function _startListener(config, resource, event) {
    const resource_name = resource.description;
    runningListeners++;

    webex[resource_name].listen().then(() => {
        console.log(fonts.info(`Listening for events from the ${fonts.highlight(resource_name)} resource`));

        if (event === 'all') {
            for (let event_name of resource.events) {
                if (event_name === 'all') {
                    continue;
                }

                webex[resource_name].on(event_name, event_object => _forwardEvent(config, event_object));
                console.log(fonts.info('Registered handler to forward ' + fonts.highlight(`${resource_name}:${event_name}`) + ' events'));
            }
        } else {
            webex[resource_name].on(event, event_object => _forwardEvent(config, event_object));
            console.log(fonts.info('Registered handler to forward ') + fonts.highlight(`${resource_name}:${event}`) + ' events');
        }
    }).catch(reason => {
        console.log(fonts.error(reason));
        process.exit(-1);
    });
}

function _stopListener(resource, event) {
    const resource_name = resource.description;

    runningListeners--;

    console.log(fonts.info(`stopping listener for ${resource_name.toUpperCase()}:${event.toUpperCase()}`));

    webex[resource_name].stopListening();

    if (event === 'all') {
        for (let event_name of resource.events) {
            if (event_name === 'all') {
                continue;
            }
            webex[resource_name].off(event_name);
        }
    } else {
        webex[resource_name].off(event);
    }
}

function _forwardEvent(config, event_object) {
    let event = JSON.stringify(event_object);
    console.log(fonts.info(`${event_object.resource}:${event_object.event} ${fonts.highlight(event_object.data.personEmail)}`));

    if (config.webhook.enabled) {
        _webhhokForwardEvent(config, event);
    }

    if (config.kafka.enabled) {
        _kafkaForwardEvent(config, event);
    }
}

function _webhhokForwardEvent(config, event) {
    const options = {
        hostname: config.webhook.host,
        port: config.webhook.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': event.length
        }
    };

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);
    });

    req.on('error', error => {
        console.log(fonts.error(error.message));
    });

    req.write(event);
    req.end();

    console.log(fonts.info('event forwarded to ' + fonts.highlight(`${config.webhook.host}:${config.webhook.port}`)));
}

function _kafkaForwardEvent(config, event) {
    const run = async () => {
        await kafkaProducer.connect()
        await kafkaProducer.send({
            topic: config.kafka.topic,
            messages: [
                {value: event},
            ],
        })
    }

    run().catch(function (e) {
        console.log(fonts.error(e));
    });
}

module.exports = {
    runListener,
    verifyAccessToken
};
