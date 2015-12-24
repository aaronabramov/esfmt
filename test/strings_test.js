/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('strings', function() {
    specify('single quotes', function() {
        let code = '\'abc\'';

        expect(format(code)).to.equal('\'abc\';');
    });

    specify('double quotes', function() {
        expect(format(`"abc"`)).to.equal(`"abc";`);
    });

    specify('string templates', function() {
        expect(format('`abc ${a} abc ${b} ced`')).to.equal('`abc ${a} abc ${b} ced`;');
    });

    specify('multiline string template', function() {
        expect(format(`\`
abc
\${cde}\``)).to.equal(`\`
abc
\${cde}\`;`);
    });
});
