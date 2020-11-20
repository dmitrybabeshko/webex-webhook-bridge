const Webex = require('webex');

const http = require('http');
const {fonts} = require('./fonts');

let webex;
let runningListeners = 0;
let specifications = {};


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

function runListener(specs, resource) {
    specifications = specs;
    const event = specs.selection.event;
    const resource_object = resource;

    _startListener(resource, event);
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

function _startListener(resource, event) {
    const resource_name = resource.description;
    runningListeners++;

    webex[resource_name].listen().then(() => {
        console.log(fonts.info(`Listening for events from the ${fonts.highlight(resource_name)} resource`));

        if (event === 'all') {
            for (let event_name of resource.events) {
                if (event_name === 'all') {
                    continue;
                }

                webex[resource_name].on(event_name, event_object => _forwardEvent(event_object));
                console.log(fonts.info('Registered handler to forward ' + fonts.highlight(`${resource_name}:${event_name}`) + ' events'));
            }
        } else {
            webex[resource_name].on(event, event_object => _forwardEvent(event_object));
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

function _forwardEvent(event_object) {
    let event = JSON.stringify(event_object);

    console.log(fonts.info(fonts.highlight(`${event_object.resource}:${event_object.event}`) + ' received'));

    const options = {
        hostname: specifications.host,
        port: specifications.port,
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

    console.log(fonts.info('event forwarded to ' + fonts.highlight(`${specifications.host}:${specifications.port}`)));
    console.log(fonts.info(event));
}

module.exports = {
    runListener,
    verifyAccessToken
};
