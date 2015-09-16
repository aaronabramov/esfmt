import invariant from '../src/invariant';
import {expect} from 'chai';

describe('invariant', function() {
    it('throws if condition is false', function() {
        expect(() => {
            invariant(false, 'message');
        }).to.throw(/message/);
    });
});
