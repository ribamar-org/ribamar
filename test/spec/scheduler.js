
var assert = require('assert');

describe('Scheduler', () => {
    const Scheduler = require('../../lib/scheduler');
    let flag, bg;
    const Router = require('../../lib/router');
    let router = new Router();
    router.routes.test = { test: () => flag = true };

    describe('#constructor()', function(){
        it('should never fail for any reason', function(){
            bg = new Scheduler();
        });
    });

    describe('#start(settings, router)', function(){

        beforeEach(function(){
            bg = new Scheduler();
        });

        after(function(){
            bg.stop();
        });

        it('should fail when missing arguments', function(){
            assert.throws(() => bg.start());
        });

        it('should run a scheduled route just fine', async function(){
            flag = false;
            this.timeout(10000);
            var s = new Date();
            s.setSeconds(s.getSeconds() + 3);
            s = s.getSeconds();
            bg.start({ test: s + ' * * * * *' }, router);
            await new Promise(done => setTimeout(done, 5000));
            assert(flag);
        });

    });

    describe('#stop()', function(){

        it('should stop all tasks', async function(){
            flag = false;
            this.timeout(10000);
            var s = new Date();
            s.setSeconds(s.getSeconds() + 3);
            s = s.getSeconds();
            bg.start({ test: s + ' * * * * *' }, router);
            await new Promise(done => setTimeout(done, 1000));
            bg.stop();
            await new Promise(done => setTimeout(done, 5000));
            assert(!flag);
        });

    });

});
