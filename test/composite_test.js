import {format} from '../src/esfmt';
import {expect} from 'chai';

describe('formatting composite code pieces', function() {
    specify('passing functon as an argument', function() {
        const code = 'fn(function(abc) {})';

        expect(format(code)).to.equal('fn(function(abc) {});');
    });

    specify('passing functon with body as an argument', function() {
        const code = 'fn(function(abc) { return 1 + 5 + abc })';

        expect(format(code)).to.equal(
`fn(function(abc) {
    return 1 + 5 + abc;
});`);
    });

    specify('passing new into a function', function() {
        const code = 'a.b.c.d.e(new A(null, {}))';

        expect(format(code)).to.equal('a.b.c.d.e(new A(null, {}));');
    });

    specify('passing binary expressions into a function', function() {
        const code = 'a(1 + 2 + null + 0x1)';

        expect(format(code)).to.equal('a(1 + 2 + null + 0x1);');
    });
});

