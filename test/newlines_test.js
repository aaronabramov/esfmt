import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('newlines', function() {
    specify('after if block', function() {
        const code =
`function abc(n) {
    if (!n) {
        throw new Error('n is required');
    }
    var lfsr = new LFSR(8, 92914);
    return lfsr.seq(n);
}`;

        expect(format(code)).to.equal(
`function abc(n) {
    if (!n) {
        throw new Error('n is required');
    }

    var lfsr = new LFSR(8, 92914);

    return lfsr.seq(n);
}`);
    });

    specify('newline after multiline object declaration', function() {
        const code = 'a.b = {a: 5, b: 6, c: 9}; module.exports = 5;';

        expect(format(code)).to.equal(
`a.b = {
    a: 5,
    b: 6,
    c: 9
};

module.exports = 5;`);
    });

    specify.skip('newline after function def as the last arg', function() {
        const code = 'a.b(4, function(a) { return 5}); a.b = 5;';

        expect(format(code)).to.equal(
`a.b(4, function(a) {
    return 5;
});

a.b = 5;`);
    });
});
