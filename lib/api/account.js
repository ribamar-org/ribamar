const mergeDeep = require('merge-deep');

const inputSchema = {
    id: { required: true },
    name: { type: String },
    passcode: {
        type: String,
        required: true,
        length: { min: 8 },
        message: {
            length: 'too short passcode'
        }
    }
};

module.exports = {

    /*------------------------------------------------------------------------o\
        Insert into database a new account and respond with newly created id.
    \o------------------------------------------------------------------------*/
    async post(data){
        let input = data.body;

        // Validate input data.
        let errors = this.utils.validate(inputSchema, input);
        if(errors){
            data.status(400);
            return errors;
        }

        // Check if credential with sent already id exists.
        if(await this.db.exists('Account', 'credentials.id', input.id)){
            data.status(400);
            return { errors: ['taken id'] };
        }

        // Generate hash and salt for input passcode.
        var { salt, hash } = this.utils.pbkdf2(input.passcode);

        // Assemble account object.
        let account = {
            creation: new Date(),
            credentials: [{
                id: input.id,
                hash: hash.toString('hex'),
                salt: salt
            }],
            data: input
        };

        // Insert new account into database.
        let dbId = await this.db.insert('Account', account);
        /* istanbul ignore next */
        if(!dbId)
            throw new Error('ACC_NOT_INSERTED');

        // Record the account creation and respond with new account id.
        this.log('Account created with id ' + dbId);
        return { id: dbId };
    },

    /*------------------------------------------------------------------------o\
        Respond with all info stored in specified account.
    \o------------------------------------------------------------------------*/
    async get(data){
        let dbId = this.db.id(data.path[1]);

        // Validate input data.
        if(!dbId)
            return data.status(404);

        // Check if account exists.
        let account = await this.db.get('Account', '_id', dbId);
        if(!account)
            return data.status(404);

        // Assemble output object and respond.
        let r = account.data || {};
        r.creation = account.creation;
        r.credentials = account.credentials;
        return r;
    },

    /*------------------------------------------------------------------------o\
        Remove the specified account from database.
    \o------------------------------------------------------------------------*/
    async delete(data){
        let dbId = this.db.id(data.path[1]);

        // Validate input data.
        if(!dbId)
            return data.status(404);

        // Attempt and remove account from database.
        let r = await this.db.delete('Account', '_id', dbId);

        // Return if account did not exist.
        if(r === 0)
            return data.status(404);

        // Register database failure.
        /* istanbul ignore next */
        else if(r === false)
            throw new Error('ACC_NOT_DELETED');

        // Record operation status.
        this.log('Account deleted with id ' + dbId);
    },

    /*------------------------------------------------------------------------o\
        Alter arbitrary info of specified account.
    \o------------------------------------------------------------------------*/
    async patch(data){
        let dbId = this.db.id(data.path[1]);

        // Validate input data.
        if(!dbId)
            return data.status(404);

        // Check if credential with sent id exists.
        let account = await this.db.get('Account', '_id', dbId);
        if(!account)
            return data.status(404);

        // Asseble new account data.
        let patch = { data: mergeDeep(account.data, data.body) };

        // Record database system failure.
        /* istanbul ignore next */
        if(!await this.db.replace('Account', '_id', dbId, patch))
            throw new Error('ACC_NOT_UPDATED');

        // Record operation status.
        this.log('Account updated with id ' + dbId);
    }

};
