/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe.skip('dynamic keys', function() {
    specify(`{[a]: 5}`, function() {
        let code = `{[a ]: 5}`;

        expect(format(code)).to.equal('{[a]: 5};');
    });
});
