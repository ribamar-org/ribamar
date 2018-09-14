
var assert = require('assert');

describe('DataBase', () => {
    const DataBase = require('../../lib/database');
    let db;
    let url = process.env.DB_URL || 'mongodb://localhost:27017';

    describe('#id(value)', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should return false when value is invalid id', function(){
            assert.equal(db.id(null), false);
            assert.equal(db.id('not id'), false);
        });

        it('should return an instance of mongo ObjectId', function(){
            assert.equal(typeof db.id(90), 'object');
            assert.equal(typeof db.id('afe645378fab'), 'object');
        });

    });

    describe('#connect(settings)', function(){

        beforeEach(function(){
            db = new DataBase();
        });

        it('should fail when missing arguments', async function(){
            this.timeout(3000);
            await assert.rejects(async function(){
                await db.connect();
            });
        });

        it('should not connect to inexisting database', async function(){
            this.timeout(3000);
            await assert.rejects(async function(){
                await db.connect({ url: 'blabla', dbName: 'blabla' });
            });
        });

        it('should connect to database when settings are valid', async function(){
            this.timeout(3000);
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
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not search when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.exists();
            });
        });

        it('should return false when document does not exist', async function(){
            assert(!await db.exists('test', 'msg', 'test1'));
        });

        it('should find documents collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.insert('test', { msg: 'test2' });
            await db.insert('test', { msg: 'test1' });
            assert(await db.exists('test', 'msg', 'test1'));
        });

    });

    describe('#get(collection, key, value)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not search when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.get();
            });
        });

        it('should return false when document does not exist', async function(){
            assert(!await db.get('test', 'msg', 'test1'));
        });

        it('should return documents collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.insert('test', { msg: 'test2' });
            await db.insert('test', { msg: 'test1' });
            assert.equal(typeof await db.get('test', 'msg', 'test1'), 'object');
        });

    });

    describe('#find(collection, query)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not search when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.find();
            });
        });

        it('should return false when document does not exist', async function(){
            let r = await db.find('test', { 'msg': 'test1' });
            assert.equal(r.length, 0);
        });

        it('should return documents collection when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.insert('test', { msg: 'test2' });
            await db.insert('test', { msg: 'test1' });
            let r = await db.find('test');
            assert.equal(typeof r, 'object');
            assert.equal(r.length, 3);
        });

    });

    describe('#delete(collection, key, value)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not delete when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.delete();
            });
        });

        it('should return zero when document does not exist', async function(){
            assert.equal(await db.delete('test', 'msg', 'test1'), 0);
        });

        it('should delete the document when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.insert('test', { msg: 'test2' });
            await db.delete('test', 'msg', 'test1');
            assert(!await db.get('test', 'msg', 'test1'));
        });

    });

    describe('#update(collection, key, value, spec)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not update when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.update();
            });
        });

        it('should return false when document does not exist', async function(){
            assert(!await db.update('test', 'msg', 'test1', { '$set': {test: ''} }));
        });

        it('should update the document when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.update('test', 'msg', 'test1', { '$set': { msg: 'test2' }});
            let doc = await db.get('test', 'msg', 'test2');
            assert.equal(doc.msg, 'test2');
        });

    });

    describe('#replace(collection, key, value, doc)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not update when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.replace();
            });
        });

        it('should return false when document does not exist', async function(){
            assert(!await db.replace('test', 'msg', 'test1', { test: '' }));
        });

        it('should update the document when everything is okay', async function(){
            await db.insert('test', { msg: 'test1' });
            await db.replace('test', 'msg', 'test1', { msg: 'test2' });
            let doc = await db.get('test', 'msg', 'test2');
            assert.equal(doc.msg, 'test2');
        });

    });

    describe('#push(collection, key, value, spec)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not push when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.push();
            });
        });

        it('should return false when document does not exist', async function(){
            assert(!await db.push('test', 'msg', 'test1', { test: '' }));
        });

        it('should push to the specified array when everything is okay', async function(){
            await db.insert('test', { id: 'hehe', msgs: ['test1'] });
            await db.push('test', 'id', 'hehe', { msgs: 'test2' });
            let doc = await db.get('test', 'id', 'hehe');
            assert.equal(doc.msgs[1], 'test2');
        });

    });

    describe('#pull(collection, key, value, spec)', function(){

        beforeEach(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
        });

        afterEach(function(){
            db.close();
        });

        it('should not pull when missing arguments', async function(){
            await assert.rejects( async function(){
                await db.pull();
            });
        });

        it('should return false when document does not exist', async function(){
            assert(!await db.pull('test', 'msg', 'test1', { test: '' }));
        });

        it('should pull to the specified item when everything is okay', async function(){
            await db.insert('test', { id: 'hehe', msgs: ['test1', 'test2'] });
            await db.pull('test', 'id', 'hehe', { msgs: 'test2' });
            let doc = await db.get('test', 'id', 'hehe');
            assert.equal(doc.msgs.length, 1);
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
