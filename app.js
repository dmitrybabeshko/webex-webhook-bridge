const resource = require('./src/resource');
const listener = require('./src/listener');
const {fonts} = require('./src/fonts');


function main() {
    let specs = {
        access_token: process.env.WEBEX_HOOK_TOKEN,
        port: parseInt(process.env.WEBEX_HOOK_PORT),
        selection: {
            resource: '',
            event: ''
        }
    };

    console.log(fonts.info('WEBEX_HOOK_TOKEN: ' + fonts.highlight(specs.access_token)));
    console.log(fonts.info('WEBEX_HOOK_PORT: ' + fonts.highlight(specs.port)));

    if ((specs.port) && (specs.access_token)) {
        listener.verifyAccessToken(specs.access_token).then((person) => {
            console.log(fonts.info(`Token authenticated as ${fonts.highlight(person.displayName)}`));
            specs.selection.event = 'all';
            for (let resource_name of resource.names) {
                listener.runListener(specs, resource.options[resource_name]);
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
