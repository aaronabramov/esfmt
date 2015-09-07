import {format} from '../esfmt';
import {expect} from 'chai';

describe('es6 modules', function() {
    specify('import', function() {
        const code = 'import A from \'a\'';

        expect(format(code)).to.equal('import A from \'a\';');
    });

    specify('import namespace', function() {
        const code = 'import * as A from \'a\'';

        expect(format(code)).to.equal('import * as A from \'a\';');
    });

    specify('import specifiers', function() {
        const code = 'import {b, c as d} from \'a\'';

        expect(format(code)).to.equal('import {b, c as d} from \'a\';');
    });

    specify('import specifiers with default', function() {
        const code = 'import f, {b, c as d} from \'a\'';

        expect(format(code)).to.equal('import f, {b, c as d} from \'a\';');
    });
});
