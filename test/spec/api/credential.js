
const assert = require('assert');
const Ribamar = require('../../../lib/main');
const fs = require('fs');

const { post, put, patch, del } = require('muhb');
const delay = s => new Promise(done => setTimeout(done, s * 1000));

let $r;

const ENDPOINT = 'http://127.0.0.1:6776/credential';
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';

describe('API: Credential', () => {

    describe('POST /credential', function(){

        before(async function(){
            this.timeout(5000);
            $r = new Ribamar();
            await $r.start({database: {url: DB_URL}});
            await delay(3);
            await $r.database.db.dropDatabase('Ribamar');
        });

        after(async function(){
            this.timeout(4000);
            $r.stop();
            await delay(3);
            fs.unlinkSync(process.cwd() + '/ribamar.log');
        });

        it('should fail when missing fields', async function(){
            let { status, body } = await post(ENDPOINT, '{}');
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'missing key');
        });

        it('should fail when passcode doesn\'t match basic security standard', async function(){
            let data =  '{"key":"jão","account":"a435ef62dcb7","passcode":"supimpa"}';
            let { status, body } = await post(ENDPOINT, data);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'too short passcode');
        });

        it('should fail when account doesn\'t exist', async function(){
            let data =  '{"key":"jão","account":"a435ef62dcb7","passcode":"supimparu"}';
            let { status, body } = await post(ENDPOINT, data);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'unknown account');
        });

        it('should fail when conflicting credential exists', async function(){
            let id = await $r.database.insert('Account', { credentials: [{key: 'jão'}]});
            let data =  '{"key":"jão","account":"'+id+'","passcode":"supimparu"}';
            let { status, body } = await post(ENDPOINT, data);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'taken key');
        });

        it('should create a new credential when everything is ok', async function(){
            let id = await $r.database.insert('Account', { credentials: [{key: 'jão2'}]});
            let data =  '{"key":"jão3","account":"'+id+'","passcode":"supimparu"}';
            let { status } = await post(ENDPOINT, data);
            assert.equal(status, 204);
            assert(await $r.database.exists('Account', 'credentials.key', 'jão3'));
        });

        it('should properly log credential creation attempt', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/added/g.test(l.toString()));
        });

    });

    describe('PATCH /credential/:key', function(){

        before(async function(){
            this.timeout(5000);
            $r = new Ribamar();
            await $r.start({database: {url: DB_URL}});
            await delay(3);
            await $r.database.db.dropDatabase('Ribamar');
        });

        after(async function(){
            this.timeout(4000);
            $r.stop();
            await delay(3);
            fs.unlinkSync(process.cwd() + '/ribamar.log');
        });

        it('should fail when missing fields', async function(){
            let { status } = await patch(ENDPOINT, '{}');
            assert.equal(status, 404);
        });

        it('should fail when credential doesn\'t exist', async function(){
            let { status } = await patch(ENDPOINT + '/unknown', '{}');
            assert.equal(status, 404);
        });

        it('should fail when passcode doesn\'t match basic security standard', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test'}] });
            let data =  '{"passcode":"supimpa"}';
            let { status, body } = await patch(ENDPOINT + '/test', data);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'too short passcode');
        });

        it('should update the password when everything is ok', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test2'}] });
            let data =  '{"passcode":"supimparu"}';
            let { status } = await patch(ENDPOINT + '/test2', data);
            assert.equal(status, 204);
            let acc = await $r.database.get('Account', 'credentials.key', 'test2');
            assert.equal(typeof acc.credentials[0].hash, 'string');
        });

        it('should properly log password update', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/Password/g.test(l.toString()));
        });

    });

    describe('PUT /credential/:key', function(){

        before(async function(){
            this.timeout(5000);
            $r = new Ribamar();
            await $r.start({database: {url: DB_URL}});
            await delay(2);
            await $r.database.db.dropDatabase('Ribamar');
        });

        after(function(){
            $r.stop();
        });

        it('should fail when missing key', async function(){
            let { status } = await put(ENDPOINT, '{}');
            assert.equal(status, 404);
        });

        it('should fail when credential doesn\'t exist', async function(){
            let { status } = await put(ENDPOINT + '/unknown', '{}');
            assert.equal(status, 404);
        });

        it('should fail when key is not present', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test'}] });
            let data =  '{"passcode":"supimparu"}';
            let { status, body } = await put(ENDPOINT + '/test', data);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'missing key');
        });

        it('should fail when passcode doesn\'t match basic security standard', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test2'}] });
            let data =  '{"key":"trap","passcode":"supimpa"}';
            let { status, body } = await put(ENDPOINT + '/test2', data);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'too short passcode');
        });

        it('should replace the credential when everything is ok', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test3'}] });
            let data =  '{"key":"trap","passcode":"supimparu"}';
            let { status } = await put(ENDPOINT + '/test3', data);
            assert.equal(status, 204);
            let acc = await $r.database.get('Account', 'credentials.key', 'trap');
            assert.equal(typeof acc.credentials[0].hash, 'string');
        });

        it('should properly log credential replacement', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/Replaced/g.test(l.toString()));
        });

    });

    describe('DELETE /credential/:key', function(){

        before(async function(){
            this.timeout(5000);
            $r = new Ribamar();
            await $r.start({database: {url: DB_URL}});
            await delay(3);
            await $r.database.db.dropDatabase('Ribamar');
        });

        after(async function(){
            this.timeout(4000);
            $r.stop();
            await delay(3);
            fs.unlinkSync(process.cwd() + '/ribamar.log');
        });

        it('should fail when missing fields', async function(){
            let { status } = await del(ENDPOINT);
            assert.equal(status, 404);
        });

        it('should fail when credential doesn\'t exist', async function(){
            let { status } = await del(ENDPOINT + '/unknown');
            assert.equal(status, 404);
        });

        it('should not delete when account has only one credential', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test'}]});
            let { status, body } = await del(ENDPOINT + '/test');
            assert.equal(status, 405);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'protected credential');
        });

        it('should delete the credential when everything is ok', async function(){
            await $r.database.insert('Account', { credentials: [{key: 'test2'}, {key: 'test3'}]});
            let { status } = await del(ENDPOINT + '/test2');
            assert.equal(status, 204);
            assert(!await $r.database.exists('Account', 'credentials.key', 'test2'));
            assert(await $r.database.exists('Account', 'credentials.key', 'test3'));
        });

        it('should properly log credential deletion', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/removed/g.test(l.toString()));
        });

    });

});
