
const assert = require('assert');
const Ribamar = require('../../../lib/main');
const fs = require('fs');

const { post, get, patch, del } = require('muhb');
const delay = s => new Promise(done => setTimeout(done, s * 1000));

let $r;

const ENDPOINT = 'http://127.0.0.1:6776/account';
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';

describe('API: Account', () => {

    describe('POST /account', function(){

        before(async function(){
            this.timeout(6000);
            $r = new Ribamar();
            await $r.start({database: {url: DB_URL}});
            await $r.restart();
            await delay(3);
            await $r.database.db.dropDatabase('Ribamar');
            await $r.database.insert('Account', { credentials: [{key: 'testoooo'}] });
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
            let { status, body } = await post(ENDPOINT, '{"key":"Jao","passcode":"123"}');
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'too short passcode');
        });

        it('should fail when conflicting credential exists', async function(){
            let { status, body } = await post(ENDPOINT, '{"key":"testoooo","passcode":"12345678"}');
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'taken key');
        });

        it('should create a new account when everything is ok', async function(){
            let input = '{"key":"test","passcode":"12345678","test":"test"}';
            let { status, body } = await post(ENDPOINT, input);
            assert.equal(status, 201);
            let o = JSON.parse(body);
            assert.equal(typeof o.id, 'string');
            assert(await $r.database.exists('Account', 'credentials.key', 'test'));
            assert(await $r.database.exists('Account', 'data.test', 'test'));
        });

        it('should properly log account creation attempt', async function(){
            let input = '{"key":"test2","passcode":"12345678"}';
            await post(ENDPOINT, input);
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/created/g.test(l.toString()));
        });

    });

    describe('GET /account/:id', function(){

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

        it('should fail when missing id', async function(){
            let { status } = await get(ENDPOINT);
            assert.equal(status, 404);
        });

        it('should fail when account doesn\'t exist', async function(){
            let { status } = await get(ENDPOINT + '/afe54637bdcf');
            assert.equal(status, 404);
        });

        it('should get account info when everything is ok', async function(){
            let data = { credentials: [{ key: 'test', hash: 'f34cc1dfe3', salt: '155b3c' }]}
            let id = await $r.database.insert('Account', data);
            let { status, body } = await get(ENDPOINT + '/' + id);
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert(Array.isArray(o.credentials));
        });

    });

    describe('DELETE /account/:id', function(){

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

        it('should fail when account doesn\'t exist', async function(){
            let { status } = await del(ENDPOINT + '/afe54637bdcf');
            assert.equal(status, 404);
        });

        it('should delete the account when everything is ok', async function(){
            let id = await $r.database.insert('Account', { credentials: [{key: 'test'}]});
            let { status } = await del(ENDPOINT + '/' + id);
            assert.equal(status, 204);
            assert(!await $r.database.exists('Account', '_id', id));
        });

        it('should properly log account deletion', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/deleted/g.test(l.toString()));
        });

    });

    describe('PATCH /account/:id', function(){

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

        it('should fail when account doesn\'t exist', async function(){
            let { status } = await patch(ENDPOINT + '/afe54637bdcf', '{}');
            assert.equal(status, 404);
        });

        it('should update the account when everything is ok', async function(){
            let acc = { credentials: [{ key: 'test' }], data: { test: 'testa' } };
            let id = await $r.database.insert('Account', acc);
            let { status } = await patch(ENDPOINT + '/' + id, '{"test":"testo"}');
            assert.equal(status, 204);
            acc = await $r.database.get('Account', '_id', $r.database.id(id));
            assert.equal(acc.data.test, 'testo');
        });

        it('should properly log account deletion', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log');
            assert(/updated/g.test(l.toString()));
        });

    });

});
