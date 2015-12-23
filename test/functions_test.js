/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('functions', function() {
    specify('function call', function() {
        const code = 'abc(a, b);';

        expect(format(code)).to.equal('abc(a, b);');
    });

    specify('method call', function() {
        const code = 'a.bc(a, b)';

        expect(format(code)).to.equal('a.bc(a, b);');
    });

    specify('function declaration', function() {
        const code = 'function abc(a, b) { return a + b; }';

        expect(format(code)).to.equal(
`function abc(a, b) {
    return a + b;
}`);
    });

    specify('arrow functions', function() {
        const code = 'const a = (a, b) => { return 5 }';

        expect(format(code)).to.equal(
`const a = (a, b) => {
    return 5;
};`);
    });

    specify('function assignment', function() {
        const code = 'var f = function(a) { return b + c; }';

        expect(format(code)).to.equal(
`var f = function(a) {
    return b + c;
};`);
    });


    specify('named function assignment', function() {
        const code = 'var f = function fn(a) { return b + c; }';

        expect(format(code)).to.equal(
`var f = function fn(a) {
    return b + c;
};`);
    });

    specify('calling constructor', function() {
        const code = 'new Constr(\'abc\')';

        expect(format(code)).to.be.equal('new Constr(\'abc\');');
    });
});
