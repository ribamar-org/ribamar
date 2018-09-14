
const assert = require('assert');

const { post, get, patch, del, put, request } = require('muhb');
const delay = s => new Promise(done => setTimeout(done, s * 1000));

describe('WebServer', () => {
    const WebServer = require('../../lib/webserver');
    const Router = require('../../lib/router');
    let router = new Router();
    let ws;

    after(function(){
        this.timeout(4000);
        ws.stop();
        delay(3);
    });

    router.routes.test500 = { get: () => { throw 'huehue'; } };
    router.routes.testget = { };
    router.routes.empty = { get: () => '' };

    router.routes.testsuccess = {
        get: () => 'GET',
        patch: () => 'PATCH',
        put: () => 'PUT',
        delete: () => 'DELETE',
        post: () => 'POST'
    };

    describe('#constructor()', function(){
        it('should never fail for any reason', function(){
            ws = new WebServer();
        });
    });

    describe('#start()', function(){

        beforeEach(function(){
            ws = new WebServer();
        });

        after(function(){
            this.timeout(4000);
            ws.stop();
            delay(3);
        });

        it('should fail when missing arguments', function(){
            assert.throws(() => ws.start());
        });

        it('should start a http server in the defined port', async function(){
            ws.start({ port: 7654 }, router);
            let { status, body } = await get('http://127.0.0.1:7654/');
            assert.equal(status, 200);
            assert.equal(body, 'It works!');
        });

    });

    describe('#stop()', function(){
        it('should stop a started server', function(){
            ws = new WebServer();
            ws.start({ port: 7654 }, router);
            ws.stop();
            assert.rejects( () => get('http://127.0.0.1:7654/') );
        });
    });

    describe('REST Compliance', function(){

        beforeEach(function(){
            ws = new WebServer();
            ws.start({ port: 7654 }, router);
        });

        afterEach(function(){
            ws.stop();
        });

        it('should pass on unknown exceptions in the API (500)', async function(){
            let { status } = await get('http://127.0.0.1:7654/test500');
            assert.equal(status, 500);
        });

        it('should refuse requests to methods inexistent in the entity (405)', async function(){
            let { status, headers } = await post('http://127.0.0.1:7654/test500', '{"got":"true"}');
            assert.equal(status, 405);
            assert.equal(headers.allow, 'GET');
        });

        it('should refuse requests to inexisting GET methods of entity (404)', async function(){
            let { status } = await get('http://127.0.0.1:7654/testget');
            assert.equal(status, 404);
        });

        it('should refuse requests to inexistent entities (404)', async function(){
            let { status } = await get('http://127.0.0.1:7654/nothing');
            assert.equal(status, 404);
        });

        it('should refuse requests with non-JSON body (400)', async function(){
            let { status } = await post('http://127.0.0.1:7654/testsuccess', 'wwfwfwfwf');
            assert.equal(status, 400);
        });

        it('should refuse GET request with body payload (400)', async function(){
            let { status } = await request('http://localhost:7654/', {}, 'GET', '{"got":"true"}');
            assert.equal(status, 400);
        });

        it('should warn the client when a response is empty (204)', async function(){
            let { status, body } = await get('http://127.0.0.1:7654/empty');
            assert.equal(status, 204);
            assert.equal(body, '');
        });

        it('should respond success to PUT and POST (201)', async function(){
            let { status, body } = await post('http://127.0.0.1:7654/testsuccess', '{"got":"true"}');
            assert.equal(status, 201);
            assert.equal(body, 'POST');
            ({ status, body } = await put('http://127.0.0.1:7654/testsuccess', '{"got":"true"}'));
            assert.equal(status, 201);
            assert.equal(body, 'PUT');
        });

        it('should respond success to GET, PATCH and DELETE (200)', async function(){
            let { status, body } = await get('http://127.0.0.1:7654/testsuccess');
            assert.equal(status, 200);
            assert.equal(body, 'GET');
            ({ status, body } = await patch('http://127.0.0.1:7654/testsuccess', '{"got":"true"}'));
            assert.equal(status, 200);
            assert.equal(body, 'PATCH');
            ({ status, body } = await del('http://127.0.0.1:7654/testsuccess'));
            assert.equal(status, 200);
            assert.equal(body, 'DELETE');
        });

    });

    describe('Router Integration', function(){

        before(function(){
            router.routes.integ = {
                get: i => JSON.stringify(i),
                post: i => JSON.stringify(i)
            };
        });

        beforeEach(function(){
            ws = new WebServer();
            ws.start({ port: 7654 }, router);
        });

        afterEach(function(){
            ws.stop();
        });

        it('should expose request headers and path to route method', async function(){
            let { body } = await get('http://127.0.0.1:7654/integ/cool');
            var o = JSON.parse(body);
            assert.equal(typeof o.headers, 'object');
            assert.equal(o.path[1], 'cool');
        });

        it('should expose request body to route method', async function(){
            let { body } = await post('http://127.0.0.1:7654/integ', '{"got":"true"}');
            var o = JSON.parse(body);
            assert.equal(typeof o.body, 'object');
        });

        it('should expose request query parameters to route method', async function(){
            let { body } = await get('http://127.0.0.1:7654/integ?e=e&a=a&e=2&e=3');
            var o = JSON.parse(body);
            assert.equal(o.query.a, 'a');
        });

    });

});
