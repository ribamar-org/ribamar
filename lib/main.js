
const getSettings = require('./settings');
const DataBase = require('./database');

module.exports = class Ribamar{
    async start(conf){
        this.settings = getSettings(conf);
        this.database = new DataBase();

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
