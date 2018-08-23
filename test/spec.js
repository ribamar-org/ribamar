var assert = require('assert');

describe('lib/settings.js', () => {
    const getSettings = require('../lib/settings');

    it('should return an object when no valid string is present',
        () => assert.equal(typeof getSettings(undefined), 'object'));

    it('should return an object when invalid path is present',
        () => assert.equal(typeof getSettings('./no-file-at-all'), 'object'));

    const testConf = getSettings('./test/settings.yml');
    it('should apply present properties',
        () => assert.equal(testConf.property, 'value'));

    it('should overwrite properties when duplicates are present',
        () => assert.equal(testConf.port, 2222));
});

describe('DataBase', () => {
    const DataBase = require('../lib/database');
    let db;
    let url = process.env.DB_URL || 'mongodb://localhost:27017';

    describe('#connect(settings)', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should fail when missing arguments', async function(){
            await assert.rejects(async function(){
                await db.connect();
            });
        });

        it('should not connect to inexisting database', async function(){
            await assert.rejects(async function(){
                await db.connect({ url: 'blabla', dbName: 'blabla' });
            });
        });

        it('should connect to database when settings are valid', async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
            db.close();
        });

    });

    describe('#insert(collection, doc)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
        });

        afterEach(function(){
            db.close();
        });

        it('should not insert when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.insert();
            });
        });

        it('should not insert when collection name is invalid', async function(){
            await assert.rejects( async function(){
                await db.insert('8test$', {});
            });
        });

        it('should insert collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test' });
        });

    });

    describe('#exists(collection, key, value)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
        });

        afterEach(function(){
            db.close();
        });

        it('should not search when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.exists();
            });
        });


        it('should find documents collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.insert('test', { msg: 'test2' });
            await db.insert('test', { msg: 'test1' });
            assert(await db.exists('test', 'msg', 'test1'));
        });

    });

    describe('#close()', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should not fail even when no connection is stablished', function(){
            db.close();
        });

        it('should close a connection just fine', async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
            db.close();
        });

    });

});

describe('Router', () => {
    const Router = require('../lib/router');
    let router;

    describe('#constructor(context)', function(){
        it('should never fail for any reason', function(){
            router = new Router();
        });
    });

    describe('#run(route)', function(){

        beforeEach(function(){
            router = new Router();
        });

        it('should fail when missing arguments', function(){
            assert.throws(() => router.run());
        });

        it('should fail when route is invalid', function(){
            assert.throws(() => router.run('83sjdhg988'));
        });

        it('should fail when route does not exist', function(){
            assert.throws(() => router.run('GET nothing'));
        });

        it('should run a route just fine', function(){
            assert.equal(typeof router.run('GET version'), 'string');
        });

        it('should expose context object to the underlying route', function(){
            router = new Router({ here: 'here' });
            router.routes.test = { test: function(){ assert.equal(this.here, 'here') }};
            router.run('TEST test');
        });

    });

});

describe('Scheduler', () => {
    const Scheduler = require('../lib/scheduler');
    let flag, bg;
    const Router = require('../lib/router');
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

describe('Logger', () => {
    const fs = require('fs');
    const Logger = require('../lib/logger');
    let logger;

    beforeEach(function(){
        logger = new Logger();
    });

    after(function(){
        logger.stop();
    });

    describe('#start(settings)', function(){

        it('should fail due to missing arguments', function(){
            assert.throws(function(){
                logger.start();
            });
        });

        it('should not start with invalid frequency', function(){
            assert.throws(function(){
                logger.start({ frequency: 0.2, path: 'blabla' });
            });
        });

        it('should start when settings are valid', function(){
            logger.start({ frequency: 1, path: 'irrelevant' });
            logger.stop();
        });

    });

    describe('#log(message, level = \'INFO\')', function(){

        beforeEach(function(){
            logger = new Logger();
            fs.writeFileSync('./test/test.log', '');
            logger.start({ frequency: 1, path: './test/test.log' });
        });

        afterEach(function(){
            logger.stop();
        })

        it('should fail due to missing arguments', function(){
            assert.throws(function(){
                logger.log();
            });
        });

        it('should successfully write to the log file', async function(){
            this.timeout(5000);
            logger.log('TEST');
            await new Promise(done => setTimeout(done, 2000));
            line = fs.readFileSync('./test/test.log', { encoding: 'utf-8' });
            assert(/\d\d\d\d-\d\d-\d\d\ \d\d:\d\d:\d\d\ INFO\ TEST/.test(line));
        });

        it('should successfully append to the log file', async function(){
            this.timeout(6000);
            logger.log('TESK');
            await new Promise(done => setTimeout(done, 2000));
            logger.log('TESI');
            await new Promise(done => setTimeout(done, 2000));
            line = fs.readFileSync('./test/test.log', { encoding: 'utf-8' });
            assert(/TESK/.test(line));
            assert(/TESI/.test(line));
        });

        it('should not write before than the specified time', async function(){
            this.timeout(5000);
            logger.log('TESA');
            await new Promise(done => setTimeout(done, 500));
            line = fs.readFileSync('./test/test.log', { encoding: 'utf-8' });
            assert(!/TESA/.test(line));
        });

        it('should write to the log file with defined level', async function(){
            this.timeout(5000);
            logger.log('TEST', 'WARN');
            await new Promise(done => setTimeout(done, 2000));
            line = fs.readFileSync('./test/test.log', { encoding: 'utf-8' });
            assert(/.*?\ .*?\ WARN\ TEST/.test(line));
        });

    });

    describe('#stop()', function(){

        it('should not fail under any circunstances', function(){
            logger = new Logger();
            logger.start({ frequency: 1, path: './test/test.log' });
            logger.stop();
        });

    });

});
