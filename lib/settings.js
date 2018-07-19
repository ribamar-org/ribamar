
// Check whether the given file exists.
function isFile(path){
    try{ return require('fs').statSync(path).isFile(); }
    catch(e){ return false; }
}

module.exports = function(path){
    path = require('path').resolve(String(path));

    // Setup default configuration object.
    var settings = {
        port: 80,
        smtp: {

        }
    };

    // Return default settings if no settings file was found.
    if(!isFile(path))
        return settings;

    // Load user supplied settings file.
    var userSettings = require('node-yaml').readSync(path);

    // Overlay default and user settings to form final settings.
    Object.assign(settings, userSettings);
    return settings;
};
