
// Check whether the given file exists.
function isFile(path){
    try{ return require('fs').statSync(path).isFile(); }
    catch(e){ return false; }
}

const defaultSettings = {
    database: {
        url: 'mongodb://localhost:27017',
        dbName: 'Ribamar'
    },
    scheduler: {
        '': '0 0 1 * *'
    },
    logger: {
        frequency: 2,
        path: process.cwd() + '/ribamar.log'
    },
    webserver: {
        port: 6776
    }
};

module.exports = function(input){
    var userSettings = {};

    // Setup default configuration object.
    var settings = defaultSettings;

    // Check if argument is a path.
    if(typeof input == 'string'){
        input = require('path').resolve(input);

        // Return default settings if no settings file was found.
        if(!isFile(input))
            return settings;

        // Load user supplied settings file.
        userSettings = require('node-yaml').readSync(input);
    }

    // Assign input if is native object.
    else if(typeof input == 'object')
        userSettings = input;

    // Overlay default and user settings to form final settings.
    Object.assign(settings, userSettings);
    return settings;
};
