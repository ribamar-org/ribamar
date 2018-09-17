var assert = require('assert');

describe('Router', () => {
    const Router = require('../../lib/router');
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
            assert.rejects(() => router.run());
        });

        it('should fail when route is invalid', function(){
            assert.rejects(() => router.run('83sjdhg988'));
        });

        it('should fail when route does not exist', function(){
            assert.rejects(() => router.run('GET nothing'));
        });

        it('should run a route just fine', async function(){
            assert.equal(typeof await router.run('GET '), 'string');
        });

        it('should expose context object to the underlying route', function(done){
            router = new Router({ here: 'here' });
            router.routes.test = { test: function(){ assert.equal(this.here, 'here'); done(); }};
            router.run('TEST test');
        });

        it('should expose input object as parameter to routed method', function(done){
            router = new Router();
            router.routes.test = { test: function(input){ assert.equal(input.got, 'here'); done(); }};
            router.run('TEST test', { got: 'here'});
        });

    });

    describe('#options(entity)', function(){

        beforeEach(function(){
            router = new Router();
        });

        it('should fail when missing arguments', function(){
            assert.throws(() => router.options());
        });

        it('should fail when inexisting entity', function(){
            assert.throws(() => router.options('baluba'));
        });

        it('should return all available methods for the given entity', function(){
            let ops = router.options('');
            assert.equal(ops.length, 1);
            assert.equal(ops[0], 'get');
        });

    });

});
