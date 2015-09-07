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

    specify('ternary operator', function() {
        const code = 'a || b ? 1 : true';

        expect(format(code)).to.equal('a || b ? 1 : true;');
    });

    specify('increment', function() {
        const code = 'a++';

        expect(format(code)).to.equal('a++;');
    });

    specify('bitwise', function() {
        const code = 'a & b';

        expect(format(code)).to.equal('a & b;');
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

    specify('try catch finally', function() {
        const code = 'try { a(5) } catch (e) { } finally { b(); }';

        expect(format(code)).to.equal(
`try {
    a(5);
} catch (e) {} finally {
    b();
}`);
    });
});
