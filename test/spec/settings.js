
var assert = require('assert');

describe('lib/settings.js', () => {
    const getSettings = require('../../lib/settings');

    it('should return the default settings when missing arguments',
        () => assert.equal(typeof getSettings(), 'object'));

    it('should return the default settings when invalid path is present',
        () => assert.equal(getSettings('./no-file-at-all').webserver.port, 6776));

    it('should read input yaml file and add its properties to resulting object', function(){
        let c = getSettings('./test/res/settings.yml');
        assert.equal(c.property, 'value');
    });

    it('should read input object file and add its properties to resulting object', function(){
        let d = getSettings({ webserver: {port: 2222} });
        assert.equal(d.webserver.port, 2222);
    });

    it('should overwrite duplicate properties in resulting object', function(){
        let c = getSettings('./test/res/settings.yml');
        assert.equal(c.webserver.port, 2222);
        let d = getSettings({ webserver: {port: 2222} });
        assert.equal(d.webserver.port, 2222);
    });
});
