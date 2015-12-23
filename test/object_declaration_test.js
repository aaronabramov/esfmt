/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('object declaration', function() {
    specify('multiline object', function() {
        const code =
`var a = {
    a: 5,
    b: function(abc) {
        a + 5;
        return 5;
    },
    c: a.b.c.d()
}`;

        expect(format(code)).to.equal(
`var a = {
    a: 5,
    b: function(abc) {
        a + 5;

        return 5;
    },
    c: a.b.c.d()
};`);
    });
});
