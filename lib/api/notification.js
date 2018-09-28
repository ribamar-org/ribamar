
const inputSchema = {
    key: { required: true, type: String },
    template: { type: String, required: true },
    data: { type: Object }
};

module.exports = {

    /*------------------------------------------------------------------------o\
        Send an e-mail message according to @template to the address in the
        account of credential identified by @key, optionaly including @data in
        the e-mail body.
    \o------------------------------------------------------------------------*/
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

        // Attempt sending e-mail to account.
        try{
            var r = await this.mail(input.template, input.key, input.data || {});
        }
        catch(e){

            // Responde if template does not exist.
            data.status(400);
            return { errors: ['unknown template'] }
        }

        // Respond success and log notification.
        data.status(200);
        this.log(`Account with e-mail ${r.to} was notified of ${input.template}.`);
    }
};
