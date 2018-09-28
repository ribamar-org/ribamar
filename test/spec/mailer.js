const assert = require('assert');
const DataBase = require('../../lib/database');
const SMTP_HOST = process.env.SMTP_HOST || 'localhost';

describe('Mailer', () => {
    const Mailer = require('../../lib/mailer');

    describe('#constructor(settings)', function(){

        it('should fail when "from" data is not supplied', function(){
            assert.throws(() => new Mailer({}));
        });

        it('should instance inactive when SMTP info IS NOT supplied', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's' });
            assert.equal(m.active, false);
        });

        it('should properly format the "from" data', function(){
            let m = new Mailer({ fromName: 'Cool Guy', fromMail: 'cool@guy.com' });
            assert.equal(m.from, '"Cool Guy" <cool@guy.com>');
        });

        it('should instance active when SMTP info IS supplied', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 'c', smtp: { host: 'b', port: 1 } });
            assert.equal(m.active, true);
        });

        it('should fail when incomplete template definition', function(){
            assert.throws(() =>
                new Mailer({
                    fromName: 'c', fromMail: 'c', smtp: { host: 'b', port: 1 },
                    templates: { test: { path: 'test/res/test.md' } }
                })
            );
        });

        it('should fail when template file does not exist', function(){
            assert.throws(() =>
                new Mailer({
                    fromName: 'c', fromMail: 'c', smtp: { host: 'b', port: 1 },
                    templates: { test: { subject: 'sub', path: 'test/res/tes.md' } }
                })
            );
        });

        it('should read template files to memory, when supplied', function(){
            let m = new Mailer({fromName: 'c', fromMail: 'c', smtp: { host: 'b', port: 1 }, templates: {
                test: { path: 'test/res/test.md', subject: 'sub' }
            }});
            assert.equal(m.templates.test.body, 'This is **markdown** {{ name }}.' + require('os').EOL);
        });

    });

    describe('#mail(template, to, data)', function(){

        it('should fail when missing arguments', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's' });
            assert.throws(() => m.mail());
        });

        it('should fail when inexisting template', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's', smtp: { host: 'b', port: 1 }});
            assert.throws(() => m.mail('tes', 'me'));
        });

        it('should do nothing when mailer is inactive', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's' });
            assert.equal(m.mail('test', 'me'), false);
        });

        it('should parse markdown from template body', function(){
            let m = new Mailer({fromName: 'c', fromMail: 'sac@sac.com',
                smtp: { host: SMTP_HOST, port: 25, tls: { rejectUnauthorized: false } },
                templates: { test: { path: 'test/res/test.md', subject: 'sub' } }
            });
            let opts = m.mail('test', 'me@me.me');
            assert.equal(opts.to, 'me@me.me');
            assert.equal(opts.html, '<p>This is <strong>markdown</strong> {undefined}.</p>');
        });

        it('should replace mustached data', function(){
            let m = new Mailer({fromName: 'c', fromMail: 'sac@sac.com',
                smtp: { host: SMTP_HOST, port: 25, tls: { rejectUnauthorized: false } },
                templates: { test: { path: 'test/res/test.md', subject: 'sub' } }
            });
            let opts = m.mail('test', 'me@me.me', { name: 'Guilherme' });
            assert.equal(opts.html, '<p>This is <strong>markdown</strong> Guilherme.</p>');
        });

    });

    describe('#mailAccount(template, key, data)', function(){

        let url = process.env.DB_URL || 'mongodb://localhost:27017';
        let db;

        before(async function(){
            db = new DataBase();
            await db.connect({ url: url, dbName: 'nodeTest' });
            await db.db.dropDatabase('nodeTest');
            let data = { email: 'blabla@blabla.com', credentials: [{ key: 'blabla@blabla.com' }]};
            await db.insert('Account', data);
        });

        after(function(){
            db.close();
        });

        it('should fail when missing arguments', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's' });
            assert.rejects(async () => await m.mailAccount());
        });

        it('should fail when inexisting template', function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's', smtp: { host: 'b', port: 1 }});
            assert.rejects(async () => await m.mailAccount('tes', 'me'));
        });

        it('should do nothing when account is not found', async function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's', db: db });
            assert.equal(await m.mailAccount('test', 'me'), false);
        });

        it('should do nothing when mailer is inactive', async function(){
            let m = new Mailer({ fromName: 'c', fromMail: 's', db: db, accountAddress: 'key' });
            assert.equal(await m.mailAccount('test', 'blabla@blabla.com'), false);
        });

        it('should supply account data to template', async function(){
            let m = new Mailer({fromName: 'c', fromMail: 'sac@sac.com', db: db, accountAddress: 'key',
                smtp: { host: SMTP_HOST, port: 25, tls: { rejectUnauthorized: false } },
                templates: { test: { path: 'test/res/test2.md', subject: 'sub' } }
            });
            let opts = await m.mailAccount('test', 'blabla@blabla.com');
            assert.equal(opts.html, '<p>This is <strong>markdown</strong> blabla@blabla.com.</p>');
        });

    });

});
