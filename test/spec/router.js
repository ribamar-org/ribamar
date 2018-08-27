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
