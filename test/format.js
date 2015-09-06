import {format} from '../esfmt';
import {expect} from 'chai';

describe.only('./nodes#format()', function() {
    specify('var declaration', function() {
        const code = 'var a = 5';

        expect(format(code)).to.equal('var a = 5;\n');
    });

    specify('multiple vars', function() {
        const code = 'var a = 5; var b = 1;';

        expect(format(code)).to.equal(`var a = 5;
var b = 1;
`);

    });

    specify('multiline var', function() {
        const code = 'var a = 1, b = 2;';

        expect(format(code)).to.equal(`var a = 1,
    b = 2;
`);
    });

    specify('let declaration', function() {
        const code = 'let a = 4';

        expect(format(code)).to.equal('let a = 4;\n');
    });

    specify('const declaration', function() {
        const code = 'const a = 4';

        expect(format(code)).to.equal('const a = 4;\n');
    });

    specify('function call', function() {
        const code = 'abc(a, b);';

        expect(format(code)).to.equal('abc(a, b);\n');
    });

    specify('method call', function() {
        const code = 'a.bc(a, b)';

        expect(format(code)).to.equal('a.bc(a, b);\n');
    });

    specify('function declaration', function() {
        const code = 'function abc(a, b) { return a + b; }';

        expect(format(code)).to.equal(
`function abc(a, b) {
    return a + b;
}
`);
    });

    specify('function assignment', function() {
        const code = 'var f = function(a) { return b + c; }';

        expect(format(code)).to.equal(
`var f = function(a) {
    return b + c;
};
`);
    });


    specify('named function assignment', function() {
        const code = 'var f = function fn(a) { return b + c; }';

        expect(format(code)).to.equal(
`var f = function fn(a) {
    return b + c;
};
`);
    });

    specify('calling constructor', function() {
        const code = 'new Constr(\'abc\')';

        expect(format(code)).to.be.equal('new Constr(\'abc\');\n');
    });

    specify('defining an object', function() {
        const code = 'var a = {a: 1, b: 2}';

        expect(format(code)).to.equal(
`var a = {
    a: 1,
    b: 2
};
`);
    });

    specify('array expression', function() {
        const code = '[1, \'2\', abc, null, undefined]';

        expect(format(code)).to.equal('[1, \'2\', abc, null, undefined]\n');
    });
});
