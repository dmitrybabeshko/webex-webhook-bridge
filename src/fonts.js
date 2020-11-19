const chalk = require('chalk');

let fonts = {
    question: (text) => {
        return chalk.bold('? ' + text + ' > ')
    },
    answer: (text) => {
        return chalk.greenBright('! ' + text)
    },
    info: (text) => {
        return chalk.black(chalk.blackBright('INFO: ') + text)
    },
    error: (text) => {
        return (chalk.red(chalk.redBright('ERROR: ') + text))
    },
    highlight: (text) => {
        return (chalk.bgYellowBright(text))
    }
};

module.exports = {fonts};


