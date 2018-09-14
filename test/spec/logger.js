
var assert = require('assert');

function delay(seconds){
    return new Promise(done => setTimeout(done, seconds * 1000));
}

describe('Logger', () => {
    const fs = require('fs');
    const Logger = require('../../lib/logger');
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
        });

        after(async function(){
            this.timeout(3000);
            await delay(2);
            fs.unlinkSync(process.cwd() + '/test/test.log');
        });

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
