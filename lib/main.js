
const getSettings = require('./settings');
const DataBase = require('./database');
const Router = require('./router');
const Scheduler = require('./scheduler');
const Logger = require('./logger');
const WebServer = require('./webserver');
const Mailer = require('./mailer');
const utils = require('./utils');

/*============================================================================o\
    An instance of this class represents a complete Ribamar server.
\o============================================================================*/
module.exports = class Ribamar{

    /*------------------------------------------------------------------------o\
        Start all Ribamar server functions.
    \o------------------------------------------------------------------------*/
    async start(confPath){
        let conf = getSettings(confPath);

        this.logger = new Logger();
        this.logger.start(conf.logger);
        let log = this.logger.log.bind(this.logger);

        this.database = new DataBase();
        await this.database.connect(conf.database);

        conf.mailer.log = log;
        conf.mailer.db = this.database;
        this.mailer = new Mailer(conf.mailer);

        // Group properties that must be available to the REST routes.
        this.router = new Router({
            utils: utils,
            db: this.database,
            conf: conf,
            mail: this.mailer.mailAccount.bind(this.mailer),
            log: log
        });

        conf.scheduler.router = this.router;
        this.scheduler = new Scheduler();
        this.scheduler.start(conf.scheduler);

        conf.webserver.router = this.router;
        this.webserver = new WebServer();
        this.webserver.start(conf.webserver);

        this.settings = conf;
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
