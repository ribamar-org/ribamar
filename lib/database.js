const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

module.exports = class DataBase{

    async connect(settings){
        settings = settings || {};
        assert(typeof settings.url == 'string');
        assert(typeof settings.dbName == 'string');

        let connConf = { reconnectTries: 4, reconnectInterval: 4000, useNewUrlParser: true };
        this.conn = await MongoClient.connect(settings.url, connConf);

        this.db = this.conn.db(settings.dbName);
    }

    async insert(collection, doc){
        assert(typeof collection == 'string');
        assert(typeof doc == 'object');

        let c = this.db.collection(collection);
        await c.insertOne(doc);
    }

    async exists(collection, key, value){
        assert(typeof collection == 'string');
        assert(typeof key == 'string');
        assert(value);

        let c = this.db.collection(collection);
        return Boolean(await c.findOne({ [key]: value }));
    }

    close(){
        if(this.conn)
            this.conn.close();
    }
};
