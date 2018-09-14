const passOnlySchema = {
    type: String,
    required: true,
    length: { min: 8 },
    message: {
        length: 'too short passcode'
    }
};

const inputPassAndId = { passcode: passOnlySchema, id: { required: true } };

const inputSchema = {
    id: { required: true },
    account: { required: true, use: { dbId: val => val } },
    passcode: passOnlySchema
};

module.exports = {

    /*------------------------------------------------------------------------o\
        Create a new credential for an existing account.
    \o------------------------------------------------------------------------*/
    async post(data){
        let input = data.body;
        let dbId = this.db.id(input.account);

        // Validate input data.
        let errors = this.utils.validate(inputSchema, input);
        if(errors){
            data.status(400);
            return errors;
        }

        // Check if account exists.
        if(!await this.db.exists('Account', '_id', dbId)){
            data.status(400);
            return { errors: ['unknown account'] };
        }

        // Check if credential id already exists.
        if(await this.db.exists('Account', 'credentials.id', input.id)){
            data.status(400);
            return { errors: ['taken id'] };
        }

        // Generate salt for new passcode.
        var { salt, hash } = this.utils.pbkdf2(input.passcode);

        // Assemble data structure.
        let spec = { credentials: {
            id: input.id,
            hash: hash,
            salt: salt
        }};

        // Insert new credential in database.
        let r = await this.db.push('Account', '_id', dbId, spec);

        // Register database failure.
        /* istanbul ignore next */
        if(!r)
            throw new Error('CRED_NOT_INSERTED');

        // Record operation status.
        this.log('Credendial added to account with id ' + dbId);
    },

    /*------------------------------------------------------------------------o\
        Alter the id and password for an existing credential.
    \o------------------------------------------------------------------------*/
    async put(data){
        let id = data.path[1] || false;
        let input = data.body;

        // Validate input id.
        if(!id)
            return data.status(404);

        // Check if credential id exists.
        let account = await this.db.get('Account', 'credentials.id', id);
        if(!account)
            return data.status(404);

        // Validate input data.
        let errors = this.utils.validate(inputPassAndId, input);
        if(errors){
            data.status(400);
            return errors;
        }

        // Encrypt new passcode.
        var { hash, salt } = this.utils.pbkdf2(input.passcode);

        // Asseble database object.
        let patch = { 'credentials.$': { id: input.id, hash: hash, salt: salt } };

        // Update stored credential.
        let r = await this.db.replace('Account', 'credentials.id', id, patch);

        // Register database failure.
        /* istanbul ignore next */
        if(!r)
            throw new Error('CRED_NOT_REPLACED');

        // Record operation status.
        this.log('Replaced credential with id ' + id);
    },

    /*------------------------------------------------------------------------o\
        Alter the password for an existing credential.
    \o------------------------------------------------------------------------*/
    async patch(data){
        let id = data.path[1] || false;

        // Validate input id.
        if(!id)
            return data.status(404);

        // Check if credential id exists.
        let account = await this.db.get('Account', 'credentials.id', id);
        if(!account)
            return data.status(404);

        // Validate input data.
        let errors = this.utils.validate({ passcode: passOnlySchema }, data.body);
        if(errors){
            data.status(400);
            return errors;
        }

        // Encrypt new password.
        let { hash, salt } = this.utils.pbkdf2(data.body.passcode);

        // Asseble database object.
        let patch = { 'credentials.$': { id: id, hash: hash, salt: salt } };

        // Update stored credential.
        let r = await this.db.replace('Account', 'credentials.id', id, patch);

        // Register database failure.
        /* istanbul ignore next */
        if(!r)
            throw new Error('CRED_NOT_UPDATED');

        // Record operation status.
        this.log('Password updated for credential with id ' + id);
    },

    /*------------------------------------------------------------------------o\
        Remove an existing credential.
    \o------------------------------------------------------------------------*/
    async delete(data){
        let id = data.path[1] || false;

        // Validate input data.
        if(!id)
            return data.status(404);

        // Check if credential id exists.
        let account = await this.db.get('Account', 'credentials.id', id);
        if(!account)
            return data.status(404);

        // Deny removing last credential.
        if(account.credentials.length < 2){
            data.status(405);
            return { errors: ['protected credential'] };
        }

        // Remove credential from database.
        let r = await this.db.pull('Account', 'credentials.id', id, {
            credentials: { id: id }
        });

        // Register database failure.
        /* istanbul ignore next */
        if(!r)
            throw new Error('CRED_NOT_DELETED');

        // Record operation status.
        this.log('Credential ' + id + ' was removed');
    },

};
