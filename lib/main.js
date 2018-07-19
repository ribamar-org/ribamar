const getSettings = require('./settings');

// Asdsemble settings object.
var settings = getSettings(process.argv[2]);

console.log('Server is running with settings: ' + JSON.stringfy(settings));
