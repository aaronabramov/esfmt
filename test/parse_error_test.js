import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('parse errors', function() {
    it('throws parse error', function() {
        expect(() => {
            format('a n n n n n n');
        }).to.throw(/Unexpected identifier/);
    });
});
