
var assert = require('assert');

describe('DataBase', () => {
    const DataBase = require('../../lib/database');
    let db;
    let url = process.env.DB_URL || 'mongodb://localhost:27017';

    describe('#connect(settings)', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should fail when missing arguments', async function(){
            await assert.rejects(async function(){
                await db.connect();
            });
        });

        it('should not connect to inexisting database', async function(){
            await assert.rejects(async function(){
                await db.connect({ url: 'blabla', dbName: 'blabla' });
            });
        });

        it('should connect to database when settings are valid', async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
            db.close();
        });

    });

    describe('#insert(collection, doc)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
        });

        afterEach(function(){
            db.close();
        });

        it('should not insert when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.insert();
            });
        });

        it('should not insert when collection name is invalid', async function(){
            await assert.rejects( async function(){
                await db.insert('8test$', {});
            });
        });

        it('should insert collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test' });
        });

    });

    describe('#exists(collection, key, value)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
        });

        afterEach(function(){
            db.close();
        });

        it('should not search when missing arguments', async function(){
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

    describe('#close()', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should not fail even when no connection is stablished', function(){
            db.close();
        });

        it('should close a connection just fine', async function(){
            await db.connect({ url: url, dbName: 'nodeTest' });
            db.close();
        });

    });

});
