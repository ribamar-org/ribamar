#!node
const Ribamar = require('../lib/main');

var server = new Ribamar(process.argv[2]);

server.start();

function handle(){
    server.stop();
}

process.on('exit', handle);
process.on('SIGINT', handle);
process.on('SIGTERM', handle);
