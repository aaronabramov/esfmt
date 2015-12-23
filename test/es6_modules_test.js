/* eslint-env mocha */

import {format} from '../src/esfmt';
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

    specify('export default', function() { const code = 'export default A';

        expect(format(code)).to.equal('export default A;');
    });

    specify('export function', function() {
        const code = 'export function abc() { return 2 }';

        expect(format(code)).to.equal(
`export function abc() {
    return 2;
};`);
    });

    specify('export default 123', function() {
        const code = 'export default 123';

        expect(format(code)).to.equal('export default 123;');
    });

    specify('export let a = 124', function() {
        const code = 'export let a = 124';

        expect(format(code)).to.equal('export let a = 124;');
    });

    specify('export {a}', function() {
        const code = 'export {a}';

        expect(format(code)).to.equal('export {a};');
    });

    specify('export {a as m, b}', function() {
        const code = 'export {a as m, b}';

        expect(format(code)).to.equal('export {a as m, b};');
    });
});
