/* eslint-env mocha */

import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('block code comments', function() {
    specify('multiline body', function() {
        const code =
` // abc
a = 5;   // cde
  // 111
b = 1;    // aa
 // sss
`;

        expect(format(code)).to.equal(
`// abc
a = 5; // cde
// 111
b = 1; // aa
// sss`);
    });

    specify('function definition comments', function() {
        const code =
`function abc(test) {
    // im a leading comment
    // me too
    a = 5; // trailing
    // leading comment of the next expression
    b = 8; // trailing2
    // trailing trailing
    // yeah
}`;

        expect(format(code)).to.equal(
`function abc(test) {
    // im a leading comment
    // me too
    a = 5; // trailing
    // leading comment of the next expression
    b = 8; // trailing2
    // trailing trailing
    // yeah
}`);
    });


    // That's weird but that's expected
    // @see https://github.com/eslint/espree/issues/41
    specify('messed up trailing comments if no semicolon', function() {
        const code =
`a = 5 // abc
`;

        expect(format(code)).to.equal(
`a = 5;
// abc`);
    });

    specify('block comments', function() {
        const code =
`function abc() {
    /**
     * 1 piece of doc
     */
    a = 5;
    /**
     * 2 piece of doc
     */
    a = 6;
    /**
     * 3 piece of doc
     */
    a = 7;
    /**
     * Trailing doc
     */
}`;

        expect(format(code)).to.equal(
`function abc() {
    /**
     * 1 piece of doc
     */
    a = 5;
    /**
     * 2 piece of doc
     */
    a = 6;
    /**
     * 3 piece of doc
     */
    a = 7;
    /**
     * Trailing doc
     */
}`);
    });

    specify('all mixed comments', function() {
        const code =
`function abc() {
    /**
     * 1 piece of doc
     */
    // some stuff
    a = 5; /* thats a block */ // trailing stuff
    // leading stuff
    /**
     * 2 piece of doc
     */
    a = 6; // trailing
    /**
     * 3 piece of doc
     */
    a = 7;
    /**
     * Trailing doc
     */
    // the last comment
}`;

        expect(format(code)).to.equal(
`function abc() {
    /**
     * 1 piece of doc
     */
    // some stuff
    a = 5; /* thats a block */ // trailing stuff
    // leading stuff
    /**
     * 2 piece of doc
     */
    a = 6; // trailing
    /**
     * 3 piece of doc
     */
    a = 7;
    /**
     * Trailing doc
     */
    // the last comment
}`);
    });
});

describe('comments in the code', function() {
    specify('trailing // comment', function() {
        const code = 'a = 5; // test';

        expect(format(code)).to.equal('a = 5; // test');
    });

    specify.skip('leading /* */', function() {
        const code = '/* test */ a + b';

        expect(format(code)).to.equal('/* test */ a + b;');
    });

    specify.skip('leading /* */ and trailing //', function() {
        const code = '/* test */ a + b; // 555 //a';

        expect(format(code)).to.equal('/* test */ a + b; // 555 //a');
    });

    specify.skip('leading /* */ and trailing // without ";"', function() {
        const code = '/* test */ a + b // 555 //a';

        expect(format(code)).to.equal('/* test */ a + b; // 555 //a');
    });

    specify.skip('/* */ in args', function() {
        const code = 'a(a, /* abc */ b); // test';

        expect(format(code)).to.equal('a(a, /* abc */, b); // test');
    });

});
