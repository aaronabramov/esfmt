import {format} from '../esfmt';
import {expect} from 'chai';

describe('formatting of deeply nested code', function() {
    specify('nested ifs', function() {
        const code = `if (a = 5) { if (null) { return '555' } else {
        if (a) null; } } else { return undefined; }`;

        expect(format(code)).to.equal(
`if (a = 5) {
    if (null) {
        return '555';
    } else {
        if (a) {
            null;
        }
    }
} else {
    return undefined;
}`);
    });

    specify('nested functions', function() {
        const code =
`a.b.c.d(function(f) {
    return void(0)
}, setTimeout(function() {
    const bb = function() {
        return function() {
            return function() {};
        };
    };
}, 100))
`;

        expect(format(code)).to.equal(
`a.b.c.d(function(f) {
    return void(0);
}, setTimeout(function() {
    const bb = function() {
        return function() {
            return function() {};
        };
    };
}, 100));`);
    });
});
