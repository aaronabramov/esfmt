import {format} from '../esfmt';
import {expect} from 'chai';

describe('formatting atomic code pieces', function() {
    specify('var declaration', function() {
        const code = 'var a = 5';

        expect(format(code)).to.equal('var a = 5;');
    });

    specify('multiple vars', function() {
        const code = 'var a = 5; var b = 1;';

        expect(format(code)).to.equal(`var a = 5;
var b = 1;`);

    });

    specify('multiline var', function() {
        const code = 'var a = 1, b = 2;';

        expect(format(code)).to.equal(`var a = 1,
    b = 2;`);
    });

    specify('let declaration', function() {
        const code = 'let a = 4';

        expect(format(code)).to.equal('let a = 4;');
    });

    specify('const declaration', function() {
        const code = 'const a = 4';

        expect(format(code)).to.equal('const a = 4;');
    });

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
};`);
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

    specify('defining an object', function() {
        const code = 'var a = {a: 1, b: 2}';

        expect(format(code)).to.equal(
`var a = {
    a: 1,
    b: 2
};`);
    });

    specify('array expression', function() {
        const code = '[1, \'2\', abc, null, undefined]';

        expect(format(code)).to.equal('[1, \'2\', abc, null, undefined];');
    });

    specify('assignment of existing var', function() {
        const code = 'abc = cde';

        expect(format(code)).to.equal('abc = cde;');
    });

    specify('oneliner if statement', function() {
        const code = 'if (abc) return 5';

        expect(format(code)).to.equal(
`if (abc) {
    return 5;
}`);
    });

    specify('ifelse statement', function() {
        const code = 'if (abc) { return 5 } else { a + 5 }';

        expect(format(code)).to.equal(
`if (abc) {
    return 5;
} else {
    a + 5;
}`);
    });
});
