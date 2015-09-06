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

    specify('function call', function() {
        const code = 'abc(a, b);';

        expect(format(code)).to.equal('abc(a, b);');
    });
});
