
const getSettings = require('./settings');

module.exports = class Ribamar{
    start(conf){
        this.settings = getSettings(conf);
    }

    stop(){

    }

    async restart(){
        await this.stop();
        await this.start();
    }
};
