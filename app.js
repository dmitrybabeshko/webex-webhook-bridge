const resource = require('./src/resource');
const listener = require('./src/listener');
const {fonts} = require('./src/fonts');


function main() {
    let config = {
        token: process.env.WEBEX_TOKEN,
        webhook: {
            enabled: false,
            host: process.env.WEBEX_WEBHOOK_HOST,
            port: parseInt(process.env.WEBEX_WEBHOOK_PORT),
        },
        kafka: {
            enabled: false,
            clientId: process.env.WEBEX_KAFKA_CLIENT,
            brokers: process.env.WEBEX_KAFKA_BROKERS === undefined ? '' : process.env.WEBEX_KAFKA_BROKERS.split(';'),
            topic: process.env.WEBEX_KAFKA_TOPIC
        },
        selection: {
            resource: '',
            event: ''
        }
    };

    console.log(fonts.info('WEBEX_TOKEN: ' + fonts.highlight(config.token)));
    console.log(fonts.info('WEBEX_WEBHOOK_HOST: ' + fonts.highlight(config.webhook.host)));
    console.log(fonts.info('WEBEX_WEBHOOK_PORT: ' + fonts.highlight(config.webhook.port)));
    console.log(fonts.info('WEBEX_KAFKA_CLIENT: ' + fonts.highlight(config.kafka.clientId)));
    console.log(fonts.info('WEBEX_KAFKA_BROKERS: ' + fonts.highlight(config.kafka.brokers)));
    console.log(fonts.info('WEBEX_KAFKA_TOPIC: ' + fonts.highlight(config.kafka.topic)));

    config.webhook.enabled = !!config.webhook.host && !isNaN(config.webhook.port);
    config.kafka.enabled = !!config.kafka.clientId && !!config.kafka.topic && config.kafka.brokers.length > 0;

    console.log(fonts.info('Webhook forward enabled: ' + fonts.highlight(config.webhook.enabled)));
    console.log(fonts.info('Kafka producer enabled: ' + fonts.highlight(config.kafka.enabled)));

    if (!!config.token && (config.webhook.enabled || config.kafka.enabled)) {
        listener.verifyAccessToken(config.token).then((person) => {
            console.log(fonts.info(`Token authenticated as ${fonts.highlight(person.displayName)}`));
            config.selection.event = 'all';
            for (let resource_name of resource.names) {
                listener.runListener(config, resource.options[resource_name]);
            }
        }).catch(reason => {
            console.log(fonts.error(reason));
            main();
        });
    } else {
        process.exit(-1);
    }
}

if (require.main === module) {
    main();
}
