
const getSettings = require('./settings');
const DataBase = require('./database');
const Router = require('./router');
const Scheduler = require('./scheduler');

module.exports = class Ribamar{
    async start(conf){
        this.settings = getSettings(conf);
        this.database = new DataBase();
        this.scheduler  = new Scheduler();

        // Group properties that must be available to the REST routes.
        this.router = new Router({
            db: this.database,
            conf: this.settings
        });

        await this.database.connect(this.settings.database);
        this.scheduler.start(this.settings.scheduler, this.router);
    }

    stop(){
        this.database.close();
        this.scheduler.stop();
    }

    async restart(){
        this.stop();
        await this.start();
    }
};
