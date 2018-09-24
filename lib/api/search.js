
const mergeDeep = require('merge-deep');

/*============================================================================o\
    Return a user-facing structuration of @doc, containing only @fields.
\o============================================================================*/
function formatAccount(doc, fields){

    // Return only id if no fields were specified.
    if(fields.length == 0)
        return doc._id.toHexString();

    // Merge arbitrary data into system fields.
    doc = mergeDeep(doc.data, doc);

    // Assemble output object with specified fields.
    let o = { account: doc._id.toHexString() };
    for(let f of fields)
        o[f] = typeof doc[f] == 'undefined' ? '' : doc[f];

    // Include credentials' ids if specified.
    if(fields.includes('credentials'))
        o.credentials = doc.credentials.map(c => c.key);
    return o;
}

module.exports = {

    /*------------------------------------------------------------------------o\
        Respond with the list of stored accounts according to parameters and
        filters.
    \o------------------------------------------------------------------------*/
    async get(data){

        // Get which fields must be returned.
        let fields = [];
        if(typeof data.query.fields === 'string')
            fields = data.query.fields.split(',');

        // Sanitize input query.
        delete data.query.fields;
        let query = this.utils.sanitizeQuery(data.query);

        // Search database according to query.
        let r = await this.db.find('Account', { data: query });

        // Formart output records and respond.
        return r.map( doc => formatAccount(doc, fields));
    }
};
