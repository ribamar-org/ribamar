var assert = require('assert');

describe('lib/settings.js', () => {
    const getSettings = require('../lib/settings');

    it('should return an object when no valid string is present',
        () => assert.equal(typeof getSettings(undefined), 'object'));

    it('should return an object when invalid path is present',
        () => assert.equal(typeof getSettings('./no-file-at-all'), 'object'));

    const testConf = getSettings('./spec/test.yml');
    it('should apply present properties',
        () => assert.equal(testConf.property, 'value'));

    it('should overwrite properties when duplicates are present',
        () => assert.equal(testConf.port, 2222));
});

describe('DataBase', () => {
    const DataBase = require('../lib/database');
    let db;
    let url = process.env.DB_URL || 'mongodb://localhost:27017';

    describe('#connect(settings)', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should fail due to missing arguments', async function(){
            await assert.rejects(async function(){
                await db.connect();
            });
        });

        it.skip('should not connect to inexisting database', async function(){
            await assert.rejects(async function(){
                await db.connect({ url: 'blabla', dbName: 'blabla' });
            });
        });

        it.skip('should connect to database when settings are valid', async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
            db.close();
        });

    });

    describe.skip('#insert(collection, doc)', function(){

        beforeEach(async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
        });

        afterEach(function(){
            db.close();
        });

        it('should not insert due to missing arguments', async function(){
            await assert.rejects( async function(){
                await db.insert();
            });
        });

        it('should not insert when when collection name is invalid', async function(){
            await assert.rejects( async function(){
                await db.insert('8test$', {});
            });
        });

        it('should insert collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test' });
        });

    });

    describe.skip('#exists(collection, key, value)', function(){

        beforeEach(async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
        });

        afterEach(function(){
            db.close();
        });

        it('should not search due to missing arguments', async function(){
            await assert.rejects( async function(){
                await db.exists();
            });
        });


        it('should find documents collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.insert('test', { msg: 'test2' });
            await db.insert('test', { msg: 'test1' });
            assert(await db.exists('test', 'msg', 'test1'));
        });

    });

});
