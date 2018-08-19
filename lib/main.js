
const getSettings = require('./settings');
const DataBase = require('./database');
const Router = require('./router');

module.exports = class Ribamar{
    async start(conf){
        this.settings = getSettings(conf);
        this.database = new DataBase();

        // Group properties that must be available to the REST routes.
        this.router = new Router({
            db: this.database,
            conf: this.settings
        });

        await this.database.connect(this.settings.database);
    }

    stop(){
        this.database.close();
    }

    async restart(){
        await this.stop();
        await this.start();
    }
};
