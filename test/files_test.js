import glob from 'glob';
import fs from 'fs';
import path from 'path';
import {format} from '../src/esfmt';
import {expect} from 'chai';

const TMP_DIR = path.resolve(process.cwd(), './tmp');

if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
}

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

        // if(testName !== 'switch') {
        //     return;
        // }

        it(testName, function() {
            // console.log(format(code).replace(/\ /g, '~'));
            let formatted = format(code, CONFIG);

            fs.writeFileSync(path.resolve(TMP_DIR, testName + '.js'), formatted);

            expect(formatted).to.equal(expected);
        });
    });
});
