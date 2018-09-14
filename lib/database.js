const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

/*============================================================================o\
    Create all mongo indexes needed for Ribamar to work properly.
\o============================================================================*/
async function createIndexes(coll){
    let unique = { unique: true };
    await coll('Account').createIndex('credentials.id', unique);
}

/*============================================================================o\
    An instance of this class represents a mongodb server.
\o============================================================================*/
module.exports = class DataBase{

    /*------------------------------------------------------------------------o\
        Connect to the mongodb instance specified in @settings.
    \o------------------------------------------------------------------------*/
    async connect(settings){

        // Validate settings.
        settings = settings || {};
        assert(typeof settings.url == 'string');
        assert(typeof settings.dbName == 'string');

        // Attempt connection to mongodb.
        this.conn = await MongoClient.connect(settings.url, {
            reconnectTries: 4,
            reconnectInterval: 4000,
            useNewUrlParser: true
        });

        // Keep a reference of the specified database.
        this.db = this.conn.db(settings.dbName);

        // Implement all indexes important to Ribamar.
        await createIndexes(this.db.collection.bind(this.db));
    }

    /*------------------------------------------------------------------------o\
        Insert the @doc object as a document in the @collection.
    \o------------------------------------------------------------------------*/
    async insert(collection, doc){

        // Validate input arguments.
        assert(typeof collection == 'string');
        assert(typeof doc == 'object');

        // Send the object to the database for insertion.
        let r = await this.db.collection(collection).insertOne(doc);

        // Return according to status of operation.
        return r.insertedCount
            ? String(r.insertedId)
            : /* istanbul ignore next */ false;
    }

    /*------------------------------------------------------------------------o\
        Return whether a document with a @key of @value exists in the
        @collection.
    \o------------------------------------------------------------------------*/
    async exists(collection, key, value){

        // Validate input arguments.
        assert(typeof collection == 'string');
        assert(typeof key == 'string');
        assert(value != undefined);

        // Query the database for the document.
        let c = this.db.collection(collection);
        return Boolean(await c.findOne({ [key]: value }));
    }

    /*------------------------------------------------------------------------o\
        Closes the mongodb connection if stablished.
    \o------------------------------------------------------------------------*/
    close(){
        if(this.conn)
            this.conn.close();
    }
};
