
import {format} from '../esfmt';
import {expect} from 'chai';

let format40 = (code) => {
    return format(code, {'max-len': 40});
}

describe('binary expressions', function() {
    it('wraps the line', function() {
        const code = 'aeeeeeeidhtns || qjkxbmweeev && aotttttttsnth';

        expect(format40(code)).to.equal(
`aeeeeeeidhtns || qjkxbmweeev &&
        aotttttttsnth;`);
    });
});
