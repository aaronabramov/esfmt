/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('destructuring', function() {
    specify.skip('let [a, b] = [5, 9];', function() {
        expect(format(this.test.title)).to.equal('let [a, b] = [5, 9];');
    });
});
