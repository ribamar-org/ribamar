const assert = require('assert');
const Schema = require('validate');
const crypto = require('crypto');

/*============================================================================o\
    Contains generaly useful, standalone function.
\o============================================================================*/
module.exports = {

    /*------------------------------------------------------------------------o\
        Use lib validate to check whether @data is correctly structured
        according to @schema.
    \o------------------------------------------------------------------------*/
    validate(schema, data){
        let s = new Schema(schema, { strip: false });

        // Put in here custom messges.
        s.message({
            required: path => `missing ${path}`
        })

        // Check if validation return any error messages.
        let r = s.validate(data);
        return r.length > 0 ? { errors: r.map(e => e.message) } : false;
    },

    // TODO comment
    salt(){
        return crypto.randomBytes(32).toString('hex');
    },

    /*------------------------------------------------------------------------o\
        Use lib crypto to generate a secure PBKDF2 iterative hash and salt
        for @passcode. Use @salt instead of generating it, if present.
    \o------------------------------------------------------------------------*/
    pbkdf2(passcode, salt){
        assert.equal(typeof passcode, 'string');

        // Generate salt for new passcode.
        salt = salt || this.salt();

        // Generate the hash for passcode.
        var hash = crypto.pbkdf2Sync(passcode, salt, 100000, 256, 'sha512');
        return { hash: hash.toString('hex'), salt: salt };
    },

    /*------------------------------------------------------------------------o\
        Remove all properties of object @query whose key contains insecure
        characters for a MongoDB query.
    \o------------------------------------------------------------------------*/
    sanitizeQuery(query){
        return Object.keys(query)
            .filter(key => !key.includes('$'))
            .reduce((obj, key) => {
                obj[key] = query[key];
                return obj;
            }, {});
    }

};
