import {format} from '../src/esfmt';
import {expect} from 'chai';

let format20 = (code) => {
    return format(code, {'max-len': 20});
}

let format40 = (code) => {
    return format(code, {'max-len': 40});
}

describe('binary expressions', function() {
    it('no line wrapping', function() {
        const code = 'aeeeeeeidhtns || qjkxbmweeev && aotttttttsnth';


        expect(format(code)).to.equal('aeeeeeeidhtns || qjkxbmweeev && aotttttttsnth;');
    });

    it('wraps the line', function() {
        const code = 'aeeeeeeidhtns || qjkxbmweeev && aotttttttsnth';

        expect(format20(code)).to.equal(
`aeeeeeeidhtns ||
        qjkxbmweeev &&
        aotttttttsnth;`);
    });

    it('wraps the line twice', function() {
        const code = 'aeeeeeeidhtns || qjkxbmweeev && aotttttttsnth';

        expect(format40(code)).to.equal(
`aeeeeeeidhtns || qjkxbmweeev &&
        aotttttttsnth;`);
    });
});
