import {format} from '../esfmt';
import {expect} from 'chai';

describe('formatting of deeply nested code', function() {
    specify('nested ifs', function() {
        const code =
`if (a = 5) {
    if (null) {
        return '555'
    } else {
        if (a) null;
    }
} else {
    return undefined;
}`;

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
});
