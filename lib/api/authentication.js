
const inputSchema = {
    key: { required: true },
    passcode: { type: String, required: true }
};

module.exports = {

    /*------------------------------------------------------------------------o\
        Respond whether @?passcode matches hash stored for credential @?key.
    \o------------------------------------------------------------------------*/
    async get(data){
        let input = data.query;

        // Check input data.
        let errors = this.utils.validate(inputSchema, input);
        if(errors){
            data.status(400);
            return errors;
        }

        // Check if credential with sent key exists.
        let account = await this.db.get('Account', 'credentials.key', input.key);
        if(!account){
            this.log(`Authentication attempted for invalid key ${input.key}`);
            return { result: 'failure' };
        }

        // Find account stored hash.
        let c = account.credentials.find(e => e.key == input.key);

        // Generate the hash for input passcode.
        let { hash } = this.utils.pbkdf2(input.passcode, c.salt);

        // Check for hashes equality.
        let r = hash == c.hash ? 'success' : 'failure';

        // Record the authentication attempt and respond.
        this.log(`Authentication for key ${input.key} resulted in ${r}`);
        return { result: r };
    }

};
