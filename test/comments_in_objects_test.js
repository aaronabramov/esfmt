import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('comments in objects', function() {
    specify('trailing //', function() {
        const code =
`let a = {
    a: 5, // trailing 1
    b: 6 // trailing 2
}`;

        expect(format(code)).to.equal(
`let a = {
    a: 5, // trailing 1
    b: 6 // trailing 2
};`);
    });

    specify('leading //', function() {
        const code =
`let a = {
    // leading 1
    a: 5, // trailing 1
    // leading 2
    b: 6 // trailing 2
}; // cde
// 123`;

        expect(format(code)).to.equal(
`let a = {
    // leading 1
    a: 5, // trailing 1
    // leading 2
    b: 6 // trailing 2
}; // cde
// 123`);
    });

    specify('// before the object', function() {
        const code =
`// abc
let a = {a: 5};
`;

        expect(format(code)).to.equal(
`// abc
let a = {
    a: 5
};`);
    });
});
