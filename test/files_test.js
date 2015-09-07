import glob from 'glob';
import fs from 'fs';
import {format} from '../';
import {expect} from 'chai';

const CONFIG = {
    newLineAtTheEnd: true
}

/**
 * This test files requires all files under `./test/files/** /code.js`
 * and compares them agains `./test/files/** /expected.js` at the same
 * path.
 */
describe('formatting files: ', function() {
    glob.sync('./test/files/**/code.js').forEach((file) => {
        const expectedFile = file.replace(/code\.js$/, 'expected.js');
        const code = fs.readFileSync(file).toString();
        const expected = fs.readFileSync(expectedFile).toString();
        const testName = file.match(/\/(\w+)\/code\.js$/)[1];

        it(testName, function() {
            // console.log(format(code).replace(/\ /g, '~'));
            expect(format(code, CONFIG)).to.equal(expected);
        });
    });
});
