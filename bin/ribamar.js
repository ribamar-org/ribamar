#!node

const Ribamar = require('../lib/main');

console.log(`All paths in conf file should be relative to ${process.cwd()}.`);

var server = new Ribamar();

function handle(){ server.stop(); }

process.on('SIGINT', handle);
process.on('SIGTERM', handle);

(async function(){
    try{
        await server.start(process.argv[2]);
        console.log(`\nRibamar is listening on TCP port ${server.settings.webserver.port}\n`);
    }
    catch(e){
        console.error(e.message + '\n');
        process.exit(1);
    }
})();
