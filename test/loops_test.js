import {format} from '../esfmt';
import {expect} from 'chai';

describe('loops', function() {
    specify('for', function() {
        const code = 'for (var i = 0; i <= 555; ++i) { d += i }';

        expect(format(code)).to.equal(
`for (var i = 0; i <= 555; ++i) {
    d += i;
}`);
    });
});
