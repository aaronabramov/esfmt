import {format} from '../esfmt';
import {expect} from 'chai';

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

    specify('multiline body', function() {
        const code =
` // abc
a = 5;   // cde
  // 111
b = 1;    // aa
 // sss
`;
        console.log(format(code).replace(/\ /g, '~'));

        expect(format(code)).to.equal(
`// abc
a = 5; // cde
// 111
b = 1; // aa
// sss`);
    });
});
