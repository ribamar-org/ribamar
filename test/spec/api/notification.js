const assert = require('assert');
const Ribamar = require('../../../lib/main');
const fs = require('fs');
const { post } = require('muhb');
const delay = s => new Promise(done => setTimeout(done, s * 1000));

let $r;

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const ENDPOINT = 'http://127.0.0.1:6776/notification';

describe('API: Notification', () => {

    before(async function(){
        this.timeout(4000);
        $r = new Ribamar();
        await $r.start({
            database: { url: DB_URL },
            mailer: {
                smtp: { host: SMTP_HOST, port: 25, tls: { rejectUnauthorized: false } },
                templates: { test: { path: 'test/res/test2.md', subject: 'sub' } }
            }
        });
        await delay(2);
        await $r.database.db.dropDatabase('Ribamar');
        await $r.database.insert('Account', { credentials: [{
            key: 'test@test.com',
        }]});
    });

    after(async function(){
        this.timeout(4000);
        $r.stop();
        await delay(3);
        fs.unlinkSync(process.cwd() + '/ribamar.log');
    });

    describe('POST /notification', function(){

        it('should fail when missing fields', async function(){
            let { status, body } = await post(ENDPOINT, '{}');
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'missing key');
            assert.equal(o.errors[1], 'missing template');
        });

        it('should fail when key doesn\'t exist', async function(){
            let { status, body } = await post(ENDPOINT, '{"key":"tes","template":"test"}');
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'unknown credential');
        });

        it('should fail when template doesn\'t exist', async function(){
            let { status, body } = await post(ENDPOINT, '{"key":"test@test.com","template":"tes"}');
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'unknown template');
        });

        it('should effectively send an e-mail notification to the account address', async function(){
            let { status } = await post(ENDPOINT, '{"key":"test@test.com","template":"test"}');
            assert.equal(status, 200);
        });

        it('should properly log e-mail sending and notification', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log').toString();
            assert(/sent/g.test(l));
            assert(/notified/g.test(l));
        });

    });

});
