/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('dynamic keys', function() {
    specify(`{[a]: 5}`, function() {
        let code = `let a = {[a]: 5}`;

        expect(format(code)).to.equal(
`let a = {
    [a]: 5
};`
        );
    });
});
