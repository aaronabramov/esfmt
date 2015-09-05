import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import esprima from 'espree';
import estraverse from 'estraverse-fb';
import esprimaOptions from '../esprima_options';
import * as esfmt from '../';


describe.skip('parses', () => {
    it('parses the ast', function() {
        const code = fs.readFileSync(path.resolve(__dirname, 'code.js.fixture'));
        const ast = esprima.parse(code, esprimaOptions);

        estraverse.traverse(ast, {
            enter: (node, parent) => {
                console.log('enter: ', node);
            },
            leave: (node, parent) => {
                console.log('leave: ', node);
            }
        });
        // console.log(JSON.stringify(ast,null,2));
    });
});


describe('generates code', function() {
    specify('simple var declaration', function() {
        const code = `var a = 5;`
        const formatted = esfmt.format(code);

        expect(formatted).to.equal(code);
    });

    specify('multiple var declarations', function() {
        const code = `
            var a = 5;
            var b = 6;
        `;
        const formatted = esfmt.format(code);

        expect(formatted).to.equal('var a = 5;\nvar b = 6;');
    });

    specify('multiline var declaration', function() {
        const code = `
            var a = 5,
                b = 6;
        `;

        const formatted = esfmt.format(code);

        console.log('code----------------');
        console.log(formatted);
        expect(formatted).to.equal('var a = 5;\nvar b = 6;');
    });
});
