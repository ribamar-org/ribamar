const assert = require('assert');
const fs = require('fs');

/*============================================================================o\
    Send all messages in the queue of @logger to its file and respawn.
\o============================================================================*/
function task(logger){

    // If there are pending messages, open the file.
    if(logger.queue.length > 0){
        var stream = fs.createWriteStream(logger.path, { flags: 'a' });

        // Dump the logger queue.
        while(logger.queue.length > 0)
            stream.write(logger.queue.shift());

        // Close the file.
        stream.end();
    }

    // If not stopped respawn.
    if(logger.running)
        setTimeout(() => task(logger), logger.frequency);
}

/*============================================================================o\
    An instance of this class represents a queued logging system.
\o============================================================================*/
module.exports = class Logger{

    /*------------------------------------------------------------------------o\
        Constructor
    \o------------------------------------------------------------------------*/
    constructor(){
        this.queue = [];
        this.running = false;
    }

    /*------------------------------------------------------------------------o\
        Start the processing of log requests as specified in @settings.
    \o------------------------------------------------------------------------*/
    start(settings){
        settings = settings || {};

        // Validate input settings.
        assert(typeof settings.frequency == 'number');
        assert(Number.isInteger(settings.frequency));
        assert(typeof settings.path == 'string');

        // Store settings (frequency is defined in seconds).
        this.frequency = settings.frequency * 1000;
        this.path = settings.path;

        // Spawn first occurrence task.
        this.running = true;
        setTimeout(() => task(this), this.frequency);
    }

    /*------------------------------------------------------------------------o\
        Stop the processing of log requests.
    \o------------------------------------------------------------------------*/
    stop(){
        this.running = false;
    }

    /*------------------------------------------------------------------------o\
        Add a new @message of defined @level and its timestamp to the queue.
    \o------------------------------------------------------------------------*/
    log(message, level){

        // Validate input settings.
        assert(typeof message == 'string');
        level = level || 'INFO';
        assert(typeof level == 'string');

        // Grab and format timestamp of now.
        let now = new Date().toISOString();
        let time = now.replace(/T/, ' ').replace(/\..+/, '');

        // Add full message to the queue.
        this.queue.push(`${time} ${level} ${message}\n`);
    }
};
