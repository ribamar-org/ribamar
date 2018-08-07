#!node
const ribamar = require('../lib/main');

// Asdsemble settings object.
var settings = ribamar.getSettings(process.argv[2]);

console.log('Server is running with settings: ' + JSON.stringify(settings));
