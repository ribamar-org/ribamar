const assert = require('assert');
const fs = require('fs');

module.exports = class Logger{

    constructor(){
        this.queue = [];
        this.running = false;
    }

    start(settings){
        settings = settings || {};

        assert(typeof settings.frequency == 'number');
        assert(Number.isInteger(settings.frequency));

        assert(typeof settings.path == 'string');

        this.frequency = settings.frequency * 1000;
        this.path = settings.path;

        this.running = true;
        setTimeout(() => this.task(), this.frequency);
    }

    stop(){
        this.running = false;
    }

    log(message, level){
        assert(typeof message == 'string');

        level = level || 'INFO';
        assert(typeof level == 'string');

        let now = new Date().toISOString();
        let time = now.replace(/T/, ' ').replace(/\..+/, '');

        this.queue.push(`${time} ${level} ${message}\n`);
    }

    task(){

        if(this.queue.length > 0){
            var stream = fs.createWriteStream(this.path, { flags: 'a' });

            while(this.queue.length > 0)
                stream.write(this.queue.shift());

            stream.end();
        }

        if(this.running)
            setTimeout(() => this.task(), this.frequency);
    }

};
