// On the production environment like Heroku, process.env.NODE_ENV is defaultly set with value is 'production'
// Therefore, we do not need to care about this env on the production environment 
var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    let configVariables = require('./config.json');

    Object.keys(configVariables[env]).forEach((key) => {
        process.env[key] = configVariables[env][key];
    })
}
