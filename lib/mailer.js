const assert = require('assert');
const nodemailer = require('nodemailer');
const fs = require('fs');
const md = require('markdown').markdown;

/*============================================================================o\
    Read all template files speficied in @temlpates.
\o============================================================================*/
function readTemplates(templates){

    // Loop through input template definitions.
    for(let k of Object.keys(templates)){
        let t = templates[k];

        // Fail if path or subject are not present.
        if(typeof t.path + typeof t.subject != 'stringstring')
            throw Error('Invalid template definition for ' + k);

        // Attempt reading the specified path.
        try{
            t.body = fs.readFileSync(t.path, 'utf8');
        }

        // Fail if specified path does not exist.
        catch(e){
            throw Error('Could not find template file at ' + t.path);
        }
    }

    // Return template sobject with aditional "body" data.
    return templates;
}

/*============================================================================o\
    Replace js mustaches in @body using @data as binding context.
\o============================================================================*/
function evalMustaches(body, data){

    // Extract data into local vars.
    for(let k in data)
        eval('var ' + k + ' = data[\'' + k + '\'];');

    // Eval and replace mustaches in markdown text.
    return body.replace(/{{([A-Za-z0-9\.\s]+)}}/g, (m, p) => {
        try{ return eval(p); }
        catch(e){ return '{undefined}'; }
    });
}

/*============================================================================o\
    An instance of this class is capable of sending e-mails to a choosen
    external SMTP server.
\o============================================================================*/
module.exports = class Mailer{

    /*------------------------------------------------------------------------o\
        Constructor
    \o------------------------------------------------------------------------*/
    constructor(settings){
        this.settings = settings;
        this.log = typeof settings.log == 'function' ? settings.log : () => {};
        this.db = typeof settings.db == 'object' ? settings.db : {};

        // Validate input data.
        assert.equal(typeof settings.fromName, 'string');
        assert.equal(typeof settings.fromMail, 'string');

        // Inactivate if SMTP info is not present.
        this.active = Boolean(settings.smtp);
        this.from = `"${settings.fromName}" <${settings.fromMail}>`;

        // Check if mailer is active.
        if(this.active){
            assert.equal(typeof settings.smtp, 'object');

            // Create SMTP transporter object.
            this.transporter = nodemailer.createTransport(settings.smtp);

            // Read template files according to settings.
            this.templates = readTemplates(settings.templates || {});
        }
    }

    /*------------------------------------------------------------------------o\
        Send the e-mail according to @template to @recipients, replacing
        template "mustaches" with @data.
    \o------------------------------------------------------------------------*/
    mail(template, recipients, data){

        // Validate input data.
        assert.equal(typeof template, 'string');
        assert.equal(typeof recipients, 'string');

        // Scape if inactive.
        if(!this.active)
            return false;

        // Fail if tmeplate does not exist.
        if(typeof this.templates[template] != 'object')
            throw Error('Could not find e-mail template ' + template);

        // Replece "mustaches" if any data was input.
        let t = this.templates[template];
        let body = evalMustaches(t.body.slice(), data || {});

        // Setup email data and convert body from markdown to HTML.
        let mailOptions = {
            from: this.from,
            to: recipients,
            subject: t.subject,
            html: md.toHTML(body)
        };

        // Send mail with defined transport object.
        this.transporter.sendMail(mailOptions, err => {

            // Log if any error ocurred when sending the e-mail.
            /* istanbul ignore next */
            if(err)
                return this.log(err.message + ' ' + JSON.stringify(mailOptions), 'MAILER');

            // Log if e-mail was successfuly relayed to SMTP server.
            this.log(`${template} e-mail sent to ${recipients}.`, 'MAILER');
        });
        return mailOptions;
    }

    /*------------------------------------------------------------------------o\
        Send the e-mail according to @template to @recipients, replacing
        template "mustaches" with @data.
    \o------------------------------------------------------------------------*/
    async mailAccount(template, key, data){
        assert.equal(typeof key, 'string');
        data = data || {};

        // Check if given account exist.
        let account = await this.db.get('Account', 'credentials.key', key);
        if(!account)
            return false;

        // Add account data to parsing bind.
        account.key = key;
        data.account = account;

        // Effectively send the mail to the found account e-mail address.
        return this.mail(template, account[this.settings.accountAddress], data);
    }
}
