/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('properties', function() {
    specify('array index access', function() {
        let code = 'abc[0]';

        expect(format(code)).to.equal('abc[0];');
    });

    specify('object prop access', function() {
        let code = 'abc[\'abc\']';

        expect(format(code)).to.equal('abc[\'abc\'];');
    });

    specify('object var prop access', function() {
        let code = 'abc[abc]';

        expect(format(code)).to.equal('abc[abc];');
    });

    specify('object fn result prop access', function() {
        let code = 'abc[abc(d)]';

        expect(format(code)).to.equal('abc[abc(d)];');
    });

    specify('object chain prop', function() {
        let code = 'abc[abc][ab[d[0]]]()';

        expect(format(code)).to.equal('abc[abc][ab[d[0]]]();');
    });
});
