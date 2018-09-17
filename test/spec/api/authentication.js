const assert = require('assert');
const Ribamar = require('../../../lib/main');
const fs = require('fs');
const { get } = require('muhb');
const delay = s => new Promise(done => setTimeout(done, s * 1000));

let $r;

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const ENDPOINT = 'http://127.0.0.1:6776/authentication';

describe('API: Authentication', () => {

    before(async function(){
        this.timeout(4000);
        $r = new Ribamar();
        await $r.start({database: {url: DB_URL}});
        await delay(2);
        await $r.database.db.dropDatabase('Ribamar');
        await $r.database.insert('ID', {id: 'test'});
        await $r.database.insert('Account', { credentials: [{
            id: 'test',
            // HASH and SALT for password: google.com
            hash: '3bb0da7e7b8184899f7c76ea03651632129e5d050e0ba8cc9e94d39a37569f53e3ac056b55af7613bba8b8366add86a357b712106366fc2b909d6fe7d3012d24de067b90e776cd4a1955224bb8aafc4cf8b0524f0b4ea57ceaac83a535cb891c656295c034a2871172e13fe72d3a0a8124ddf8567519c43b0cf7ef693750de0a4c02a392a61357997fc8870dbff9c7e92173e264a3b3f19f53ca7c3e48e8c90f66dc9200022edeca3078c761ee8023bacfcdac7ba694894948d19cf83f8634c72c6e36301eecfb73a8246a2984769c3c69faa7349e6b900a44a6b49b371d8853864f1e143eb8c8d179555659a67b8d6891b81c5b25776c58a63e77f34cc1dfe3',
            salt: '155d20c7bc7c2187466bcdeac543a8a66b68b493a7d836d2b48882955845ab3c'
        }]});
    });

    after(async function(){
        this.timeout(4000);
        $r.stop();
        await delay(3);
        fs.unlinkSync(process.cwd() + '/ribamar.log');
    });

    describe('GET /authentication ? id=:id & passcode=:pc', function(){

        it('should fail when missing fields', async function(){
            let { status, body } = await get(ENDPOINT);
            assert.equal(status, 400);
            let o = JSON.parse(body);
            assert.equal(o.errors[0], 'missing id');
        });

        it('should fail when id doesn\'t exist', async function(){
            let { status, body } = await get(ENDPOINT + '?id=testo&passcode=googlecom');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(o.result, 'failure');
        });

        it('should fail when passcode doesn\'t match stored one', async function(){
            let { status, body } = await get(ENDPOINT + '?id=test&passcode=googlecom');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(o.result, 'failure');
        });

        it('should succeed when id and passcode are fine', async function(){
            let { status, body } = await get(ENDPOINT + '?id=test&passcode=google.com');
            assert.equal(status, 200);
            let o = JSON.parse(body);
            assert.equal(o.result, 'success');
        });

        it('should properly log authentication attempts', async function(){
            this.timeout(4000);
            await delay(2);
            let l = fs.readFileSync(process.cwd() + '/ribamar.log').toString();
            assert(/attempted/g.test(l));
            assert(/failure/g.test(l));
            assert(/success/g.test(l));
        });

    });

});
