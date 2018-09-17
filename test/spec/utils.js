var assert = require('assert');

describe('/lib/utils.js', () => {
    const utils = require('../../lib/utils');

    describe('#validate(schema, data)', function(){

        it('should return error when a required field is missing', function(){
            let r = utils.validate({ id: { required: true } }, {});
            assert.equal(r.errors[0], 'missing id');
        });

        it('should return error when a length is not fulfilled', function(){
            let r = utils.validate({
                passcode: { length: { min: 8 }, message: { length: 'error' } }
            }, { passcode: 'minime' });
            assert.equal(r.errors[0], 'error');
        });

        it('should return false if no errors are found', function(){
            let r = utils.validate({
                id: { required: true },
                passcode: { length: { min: 8 }, message: { length: 'error' } }
            }, { passcode: 'minimene', id: 90 });
            assert(!r);
        });

    });

    describe('#pbkdf2(passcode, salt)', function(){

        it('should fail when passcode is missing', function(){
            assert.throws( () => utils.pbkdf2() );
        });

        it('should succeed if anything is ok', function(){
            assert.equal(typeof utils.pbkdf2('google.com').hash, 'string');
        });

        it('should succeed when salt is sent along', function(){
            let hash = '3bb0da7e7b8184899f7c76ea03651632129e5d050e0ba8cc9e94d39a37569f53e3ac056b55af7613bba8b8366add86a357b712106366fc2b909d6fe7d3012d24de067b90e776cd4a1955224bb8aafc4cf8b0524f0b4ea57ceaac83a535cb891c656295c034a2871172e13fe72d3a0a8124ddf8567519c43b0cf7ef693750de0a4c02a392a61357997fc8870dbff9c7e92173e264a3b3f19f53ca7c3e48e8c90f66dc9200022edeca3078c761ee8023bacfcdac7ba694894948d19cf83f8634c72c6e36301eecfb73a8246a2984769c3c69faa7349e6b900a44a6b49b371d8853864f1e143eb8c8d179555659a67b8d6891b81c5b25776c58a63e77f34cc1dfe3';
            let salt = '155d20c7bc7c2187466bcdeac543a8a66b68b493a7d836d2b48882955845ab3c';
            assert.equal(utils.pbkdf2('google.com', salt).hash, hash);
        });

    });

    describe('#sanitizeQuery(query)', function(){

        it('should remove object keys containing "$"', function(){
            let r = utils.sanitizeQuery({a: 'a', '$b': 'b', c: 'c'});
            assert.equal(typeof r, 'object');
            assert.equal(Object.keys(r).length, 2);
            assert.equal(r['$b'], undefined);
        });

    });

});
