/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

let format20 = (code) => {
    return format(code, {'max-len': 20});
};


describe('array', function() {
    specify('one line array', function() {
        const code = '[1, \'2\', abc, null, undefined]';

        expect(format(code)).to.equal('[1, \'2\', abc, null, undefined];');
    });

    specify('multiline array', function() {
        const code = '[123456, 123456, 123456, 123456, 123456]';

        expect(format(code)).to.equal('[123456, 123456, 123456, 123456, 123456];');
        expect(format20(code)).to.equal(
`[
    123456,
    123456,
    123456,
    123456,
    123456
];`);
    });
});
