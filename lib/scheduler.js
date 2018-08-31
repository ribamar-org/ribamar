const assert = require('assert');
const cron = require('node-cron');

// Put here all routes to be executed as background tasks.
const routes = {
    '': 'GET '
}

/*============================================================================o\
    Instances of this class allow the background execution of scheduled routes
    similarly to UNIX Cron.
\o============================================================================*/
module.exports = class Scheduler{

    /*------------------------------------------------------------------------o\
        Constructor
    \o------------------------------------------------------------------------*/
    constructor(){
        this.tasks = {};
    }

    /*------------------------------------------------------------------------o\
        Schedule all routes from @router according to specs in @settings;
    \o------------------------------------------------------------------------*/
    start(settings, router){
        settings = settings || {};

        // Loop through routes defined as background.
        for(let r in routes){

            // Check spec format.
            assert.equal(typeof settings[r], 'string');
            assert(cron.validate(settings[r]));

            // Schedule route according to spec.
            let task = cron.schedule(settings[r], () => router.run(routes[r]));
            assert(task);
            this.tasks[r] = task;
        }
    }

    /*------------------------------------------------------------------------o\
        Stop and erase all scheduled routes.
    \o------------------------------------------------------------------------*/
    stop(){
        for(let t of Object.values(this.tasks))
            t.destroy();
    }
};
