
var assert = require('assert');

describe('lib/settings.js', () => {
    const getSettings = require('../../lib/settings');

    it('should return an object when no valid string is present',
        () => assert.equal(typeof getSettings(undefined), 'object'));

    it('should return an object when invalid path is present',
        () => assert.equal(typeof getSettings('./no-file-at-all'), 'object'));

    const testConf = getSettings('./test/settings.yml');
    it('should apply present properties',
        () => assert.equal(testConf.property, 'value'));

    it('should overwrite properties when duplicates are present',
        () => assert.equal(testConf.port, 2222));
});
