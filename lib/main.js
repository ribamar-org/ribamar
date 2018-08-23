
const getSettings = require('./settings');
const DataBase = require('./database');
const Router = require('./router');
const Scheduler = require('./scheduler');
const Logger = require('./logger');

module.exports = class Ribamar{
    async start(conf){
        this.settings = getSettings(conf);
        this.database = new DataBase();
        this.scheduler  = new Scheduler();
        this.logger  = new Logger();

        // Group properties that must be available to the REST routes.
        this.router = new Router({
            db: this.database,
            conf: this.settings,
            log: (msg, level) => this.logger.log(msg, level),
            warn: msg => this.logger.log(msg, 'WARN'),
            error: msg => this.logger.log(msg, 'ERROR')
        });

        await this.database.connect(this.settings.database);
        this.scheduler.start(this.settings.scheduler, this.router);
        this.logger.start(this.settings.logger);
    }

    stop(){
        this.database.close();
        this.scheduler.stop();
        this.logger.stop();
    }

    async restart(){
        this.stop();
        await this.start();
    }
};
