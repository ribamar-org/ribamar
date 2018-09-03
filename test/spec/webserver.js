
const assert = require('assert');

describe('WebServer', () => {
    const WebServer = require('../../lib/webserver');
    const http = require('http');
    const { URL } = require('url');
    const Router = require('../../lib/router');
    let router = new Router();

    function request(url, headers, method, data){
        let cb = arguments[4] || false;
        let cbe = arguments[5] || false;
        url = new URL(url);
        let options = {
            hostname: 'localhost',
            port: url.port,
            method: method || 'GET',
            path: url.pathname + url.search,
            headers: headers || {}
        };
        let req = http.request(options, res => {
            if(cbe)
                res.on('error', cbe);
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => cb(res.statusCode, res.headers, body));
        });
        if(cbe)
            req.on('error', cbe);
        if(data)
            req.write(data);
        req.end();
    }

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

    let ws;

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
            ws.stop();
        });

        it('should fail when missing arguments', function(){
            assert.throws(() => ws.start());
        });

        it('should start a http server in the defined port', function(done){
            ws.start({ port: 7654 }, router);
            request('http://127.0.0.1:7654/', {}, 'GET', false, (s, h, b) => {
                assert.equal(s, 200);
                assert.equal(b, 'It works!');
                done();
            });
        });

    });

    describe('#stop()', function(){
        it('should stop a started server', function(done){
            ws = new WebServer();
            ws.start({ port: 7654 }, router);
            ws.stop();
            request('http://127.0.0.1:7654/', {}, 'GET', false, function(){}, () => {
                done();
            });
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

        it('should pass on unknown exceptions in the API (500)', function(done){
            request('http://localhost:7654/test500', {}, 'GET', false, s => {
                assert.equal(s, 500);
                done();
            });
        });

        it('should refuse requests to methods inexistent in the entity (405)', function(done){
            request('http://localhost:7654/test500', {}, 'POST', '{"got":"true"}', (s, h) => {
                assert.equal(s, 405);
                assert.equal(h.allow, 'GET');
                done();
            });
        });

        it('should refuse requests to inexisting GET methods of entity (404)', function(done){
            request('http://localhost:7654/testget', {}, 'GET', false, s => {
                assert.equal(s, 404);
                done();
            });
        });

        it('should refuse requests to inexistent entities (404)', function(done){
            request('http://localhost:7654/nothing', {}, 'GET', false, s => {
                assert.equal(s, 404);
                done();
            });
        });

        it('should refuse requests with non-JSON body (400)', function(done){
            request('http://localhost:7654/testsuccess', {}, 'POST', 'wwfwfwfwf', s => {
                assert.equal(s, 400);
                done();
            });
        });

        it('should refuse GET request with body payload (400)', function(done){
            request('http://localhost:7654/', {}, 'GET', '{"got":"true"}', s => {
                assert.equal(s, 400);
                done();
            });
        });

        it('should warn the client when a response is empty (204)', function(done){
            request('http://localhost:7654/empty', {}, 'GET', false, (s, h, b) => {
                assert.equal(b, '');
                assert.equal(s, 204);
                done();
            });
        });

        it('should respond success to PUT and POST (201)', function(done){
            request('http://localhost:7654/testsuccess', {}, 'POST', '{"got":"true"}', (s, h, b) => {
                assert.equal(s, 201);
                assert.equal(b, 'POST');
                request('http://localhost:7654/testsuccess', {}, 'PUT', '{"got":"true"}', (s, h, b) => {
                    assert.equal(s, 201);
                    assert.equal(b, 'PUT');
                    done();
                });
            });
        });

        it('should respond success to GET, PATCH and DELETE (200)', function(done){
            request('http://localhost:7654/testsuccess', {}, 'GET', false, (s, h, b) => {
                assert.equal(s, 200);
                assert.equal(b, 'GET');
                request('http://localhost:7654/testsuccess', {}, 'PATCH', '{"got":"true"}', (s, h, b) => {
                    assert.equal(s, 200);
                    assert.equal(b, 'PATCH');
                    request('http://localhost:7654/testsuccess', {}, 'DELETE', false, (s, h, b) => {
                        assert.equal(s, 200);
                        assert.equal(b, 'DELETE');
                        done();
                    });
                });
            });
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

        it('should expose request headers to route method', function(done){
            request('http://localhost:7654/integ', {}, 'GET', false, (s, h, b) => {
                var o = JSON.parse(b);
                assert.equal(typeof o.headers, 'object');
                done();
            });
        });

        it('should expose request body to route method', function(done){
            request('http://localhost:7654/integ', {}, 'POST', '{"got":"true"}', (s, h, b) => {
                var o = JSON.parse(b);
                assert.equal(typeof o.body, 'object');
                done();
            });
        });

        it('should expose request query parameters to route method', function(done){
            request('http://localhost:7654/integ?e=e&a=a&e=2&e=3', {}, 'GET', false, (s, h, b) => {
                var o = JSON.parse(b);
                assert.equal(o.query.a, 'a');
                done();
            });
        });

    });


});
