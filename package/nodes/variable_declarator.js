/**
 *  {
 *      type: 'VariableDeclarator',
 *      id: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      init: {
 *          type: 'Literal',
 *          value: 5,
 *          raw: '5'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    recur(node.id);
    if (node.init) {
        context.write(' = ');
        recur(node.init);
    }
}

;