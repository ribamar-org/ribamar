const fs = require('fs');
const yaml = require('node-yaml');
const path = require('path');
const cloneDeep = require('clone-deep');
const mergeDeep = require('merge-deep');

/*============================================================================o\
    Check whether the given file exists.
\o============================================================================*/
function isFile(path){
    try{ return fs.statSync(path).isFile(); }
    catch(e){ return false; }
}

/*============================================================================o\
    This object contaoinis the minimum default settings for Ribamar.
\o============================================================================*/
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

/*============================================================================o\
    Return an object containing all necessary settings for Ribamar to work.
    If @input is a valid path, the file settings are overlayed on default ones.
    If @input is an object, it is merged over default settings.
\o============================================================================*/
module.exports = function(input){
    var userSettings = {};

    // Setup default configuration object.
    var settings = cloneDeep(defaultSettings);

    // Check if argument is a path.
    if(typeof input == 'string'){
        input = path.resolve(input);

        // Return default settings if no settings file was found.
        if(!isFile(input))
            return settings;

        // Load user supplied settings file.
        userSettings = yaml.readSync(input);
    }

    // Assign input if is native object.
    else if(typeof input == 'object')
        userSettings = input;

    // Overlay default and user settings to form final settings.
    settings = mergeDeep(settings, userSettings);
    return settings;
};
