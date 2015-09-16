/**
 *  {
 *      type: 'SwitchStatement',
 *      discriminant: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      cases: [{
 *          type: 'SwitchCase',
 *          test: [Object],
 *          consequent: [Object]
 *      }, {
 *          type: 'SwitchCase',
 *          test: [Object],
 *          consequent: [Object]
 *      }, {
 *          type: 'SwitchCase',
 *          test: null,
 *          consequent: [Object]
 *      }]
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('switch (');
    recur(node.discriminant);
    context.write(') {');
    context.indentIn();

    for (var i = 0; i < node.cases.length; i++) {
        context.write('\n', context.getIndent());
        recur(node.cases[i]);
    }
    context.indentOut();
    context.write('\n', context.getIndent(), '}');
}