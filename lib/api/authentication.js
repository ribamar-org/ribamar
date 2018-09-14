
const inputSchema = {
    id: { required: true },
    passcode: { type: String, required: true }
};

module.exports = {

    /*------------------------------------------------------------------------o\
        Respond whether @?passcode matches hash stored for credential @?id.
    \o------------------------------------------------------------------------*/
    async get(data){
        let input = data.query;

        // Check input data.
        let errors = this.utils.validate(inputSchema, input);
        if(errors){
            data.status(400);
            return errors;
        }

        // Check if credential with sent id exists.
        let account = await this.db.get('Account', 'credentials.id', input.id);
        if(!account){
            this.log(`Authentication attempted for invalid id ${input.id}`);
            return { result: 'failure' };
        }

        // Find account stored hash.
        let c = account.credentials.find(e => e.id == input.id);

        // Generate the hash for input passcode.
        let { hash } = this.utils.pbkdf2(input.passcode, c.salt);

        // Check for hashes equality.
        let r = hash == c.hash ? 'success' : 'failure';

        // Record the authentication attempt and respond.
        this.log(`Authentication for id ${input.id} resulted in ${r}`);
        return { result: r };
    }

};
