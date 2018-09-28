const credentialAPI = require('./credential');

module.exports = {

    async post(data){
        let input = data.body;

        // Check input data.
        let errors = this.utils.validate(inputSchema, input);
        if(errors){
            data.status(400);
            return errors;
        }

        // Check if credential with sent key exists.
        if(!await this.db.exists('Account', 'credentials.key', input.key)){
            data.status(400);
            return { errors: ['unknown credential'] };
        }

        let expiry = new Date();
        expiry.setHours( expiry.getHours() + this.settings.resetExpiry );
        let reset = { token: this.utils.salt(), expiry: expiry, key: input.key };
        this.db.insert('Recovery', reset);

        if(this.settings.recoveryEmail)
            await this.mail('reset', input.key, reset);

        this.log(`Credential reset created for key ${input.key}.`);
        delete reset.key;
        return reset;
    },

    expire(){

        let expired = this.db.find('Reset', { expiry: { '$lt': new Date() } });

        for(let r of expired)
            this.db.delete('Reset', '_id', r._id);

    },

    async get(data){
        let token = data.path[1] || false;

        // Validate input token.
        if(!token)
            return data.status(404);

        // Check if reset token exists.
        let reset = await this.db.get('Reset', 'token', token);
        if(!reset)
            return data.status(404);

        if(this.settings.resetType == 'auto'){

            let newPasscode = { passcode: this.utils.salt() };

            let r = credentialAPI.patch({
                path: ['', reset.key],
                status: data.status,
                body: newPasscode
            });

            return r ? null : newPasscode;

        }

        // then is manual
        data.status(303);
        data.setHeader('Location', '/credential/' + reset.key);
        return { method: 'PATCH' };

    }
};
