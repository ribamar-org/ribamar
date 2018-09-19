#!node

const Ribamar = require('../lib/main');

const confPath = process.env.RIBAMAR_CONF_PATH || process.argv[2];

console.log(`All paths in conf file should be relative to ${process.cwd()}.`);

var server = new Ribamar();

(async function(){
    try{
        await server.start(confPath);
        console.log(`\nRibamar is listening on TCP port ${server.settings.webserver.port}`);
    }
    catch(e){
        console.error(e.message);
        process.exit();
    }
})();

function handle(){
    server.stop();
}

process.on('exit', handle);
process.on('SIGINT', handle);
process.on('SIGTERM', handle);
