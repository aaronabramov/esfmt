import {format} from '../esfmt';
import {expect} from 'chai';

describe.skip('comments in the code', function() {
    specify('// comment', function() {
        const code = 'a = 5; // test';

        expect(format(code)).to.equal('a = 5; // test');
    });

    specify('/* */ in args', function() {
        const code = 'a(a, /* abc */ b); // test';

        expect(format(code)).to.equal('a(a, /* abc */, b); // test');
    });
});
