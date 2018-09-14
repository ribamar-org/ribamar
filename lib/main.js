
const getSettings = require('./settings');
const DataBase = require('./database');
const Router = require('./router');
const Scheduler = require('./scheduler');
const Logger = require('./logger');
const WebServer = require('./webserver');

/*============================================================================o\
    An instance of this class represents a complete Ribamar server.
\o============================================================================*/
module.exports = class Ribamar{

    /*------------------------------------------------------------------------o\
        Start all Ribamar server functions.
    \o------------------------------------------------------------------------*/
    async start(conf){
        this.settings = getSettings(conf);
        this.database = new DataBase();
        this.scheduler = new Scheduler();
        this.logger = new Logger();
        this.webserver = new WebServer();

        // Group properties that must be available to the REST routes.
        this.router = new Router({
            db: this.database,
            conf: this.settings,
            log: (msg, level) => this.logger.log(msg, level)
        });

        await this.database.connect(this.settings.database);
        this.scheduler.start(this.settings.scheduler, this.router);
        this.logger.start(this.settings.logger);
        this.webserver.start(this.settings.webserver, this.router);
    }

    /*------------------------------------------------------------------------o\
        Stop all Ribamar server functions.
    \o------------------------------------------------------------------------*/
    stop(){
        this.database.close();
        this.scheduler.stop();
        this.logger.stop();
        this.webserver.stop();
    }

    /*------------------------------------------------------------------------o\
        Subsequently stop and start the server.
    \o------------------------------------------------------------------------*/
    async restart(){
        this.stop();
        await this.start(this.settings);
    }
};
