/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('grouping using paratheses', function() {
    specify('left binary has less precedence', function() {
        const code = '(1 + 2) / 3';

        expect(format(code)).to.equal('(1 + 2) / 3;');
    });

    specify('right binary has less precedence', function() {
        const code = '1 / (2 + 3)';

        expect(format(code)).to.equal('1 / (2 + 3);');
    });

    specify('both binaries has less precedence', function() {
        const code = '(1 + 2) / (3 + 4)';

        expect(format(code)).to.equal('(1 + 2) / (3 + 4);');
    });


    specify('assignment', function() {
        const code = 'a || (a = 4)';

        expect(format(code)).to.equal('a || (a = 4);');
    });

    specify('grouping logical operators', function() {
        const code = 'if (!n) {  }';

        expect(format(code)).to.equal('if (!n) {}');
    });
});
