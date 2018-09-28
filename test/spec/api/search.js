
const assert = require('assert');
const Ribamar = require('../../../lib/main');
const { get } = require('muhb');
const delay = s => new Promise(done => setTimeout(done, s * 1000));

let $r;

const ENDPOINT = 'http://127.0.0.1:6776/search';
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';

describe('API: Search', () => {

    describe('GET /search ? fields=:f1,:f2,:f3 & :parameters', function(){

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

        it('should list all account ids when nothing special is input', async function(){
            await $r.database.insert('Account', { data: {}, random: 28, credentials: [ {key: 't1'} ]});
            await $r.database.insert('Account', { data: {}, credentials: [ {key: 't2'} ] });
            let { status, body } = await get(ENDPOINT);
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(typeof o[0], 'string');
        });

        it('should list accounts and specified fields', async function(){
            await $r.database.insert('Account', { data: {}, creation: new Date(), credentials: [ {key: 't3'} ]});
            await $r.database.insert('Account', { data: {}, creation: new Date(), credentials: [ {key: 't4'} ]});
            let { status, body } = await get(ENDPOINT + '?fields=creation');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(typeof o[2].account, 'string');
            assert.equal(typeof o[2].creation, 'string');
        });

        it('should list accounts and credentials when asked', async function(){
            let { status, body } = await get(ENDPOINT + '?fields=credentials');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert(Array.isArray(o[0].credentials));
        });

        it('should list data fields when asked', async function(){
            let { status, body } = await get(ENDPOINT + '?fields=creation,random');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(o[0].random, 28);
        });

        it('should list only rows matching the query', async function(){
            await $r.database.insert('Account', { data: { test: '2' }, credentials: [ {key: 't5'} ]});
            await $r.database.insert('Account', { data: { test: '2' }, credentials: [ {key: 't6'} ]});
            let { status, body } = await get(ENDPOINT + '?fields=test&test=2&$eq=3');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(o.length, 2);
        });

    });

});
