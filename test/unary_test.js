/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('unary operators', function() {
    specify('void(0)', function() {
        const code = 'void(0)';

        expect(format(code)).to.equal('void(0);');
    });

    specify('i--', function() {
        const code = 'i--';

        expect(format(code)).to.equal('i--;');
    });

    specify('++i', function() {
        const code = '++i';

        expect(format(code)).to.equal('++i;');
    });

    specify('typeof a', function() {
        const code = 'typeof a';

        expect(format(code)).to.equal('typeof a;');
    });
});
