/* eslint-env mocha */

import glob from 'glob';
import fs from 'fs';
import path from 'path';
import {format} from '../src/esfmt';
import {expect} from 'chai';

const SNIPPETS_DIR = path.resolve(__dirname, './code_snippets');

function shiftLine(string) {
    let endIndex = string.indexOf('\n');
    return string.substring(endIndex + 1, string.length);
}

describe('code snippets', function() {
    glob.sync((path.resolve(SNIPPETS_DIR, '*.js'))).forEach(file => {
        const TEST_DEF_REGEX = /^\/\/[\s]+input\:[\s]*/gm;
        let content = fs.readFileSync(file).toString();
        let filename = path.basename(file, '.js');

        content = content.replace('/* eslint-disable */', '');
        let tests = content.split(TEST_DEF_REGEX);
        tests.shift(); // remove an empty string from the beginning

        tests.forEach(test => {
            const CONFIG_DEF_REGEX = /^\/\/[\s]+config\:[\s]+(.+)\n/gm;
            const SKIPONLY_REGEX = /^\/\/[\s]+(skip|only)[\s]*\n/gm;
            let descriptionEndIndex = test.indexOf('\n');
            let description = test.substring(0, descriptionEndIndex);

            // rest of the test definition (without description);
            let rest = shiftLine(test);

            // mocha function to define the test (specify, specify.only or specify.skip)
            let fn;

            // // skip or // only line that will blacklist or whitelist the test (specify.only|skip)
            let skiponlyLine = rest.match(SKIPONLY_REGEX);
            let skiponly = null;

            if (skiponlyLine) {
                skiponly = SKIPONLY_REGEX.exec(skiponlyLine)[1];
                rest = shiftLine(rest);

            }

            switch (skiponly) {
            case 'only':
                fn = specify.only;
                break;
            case 'skip':
                fn = specify.skip;
                break;
            default:
                fn = specify;
            }

            // `// config: {a: b}` line
            let configLine = rest.match(CONFIG_DEF_REGEX);
            let config = {};

            if (configLine) {
                // the `{a: b}` part of the config line
                let json = CONFIG_DEF_REGEX.exec(configLine)[1];

                try {
                    config = JSON.parse(json);
                } catch (error) {
                    throw new Error(`
                        Error parsing json configuration: ${json}
                    `);
                }

                rest = shiftLine(rest);
            }

            let [code, expected] = rest.split(/\n\/\/[\s]+output\:\n/gm);

            // get rid of all newlines before and after the code
            code = code.replace(/^\n+/, '').replace(/\n*$/, '');
            expected = expected.replace(/^\n+/, '').replace(/\n*$/, '');


            fn(`${filename}: ${description}, config: ${JSON.stringify(config)}`, function() {
                let formatted = format(code, config);

                formatted = formatted.replace(/\n*$/, '');

                expect(formatted).to.equal(expected);
            });
        });
    });
});
