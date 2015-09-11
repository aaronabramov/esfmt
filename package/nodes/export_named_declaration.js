/**
 *  {
 *      type: 'ExportNamedDeclaration',
 *      declaration: {
 *          type: 'FunctionDeclaration',
 *          id: {
 *              type: 'Identifier',
 *              name: 'abc',
 *          },
 *          params: [],
 *          body: {
 *              type: 'BlockStatement',
 *              body: [Object],
 *          },
 *          generator: false,
 *          expression: false,
 *      },
 *      specifiers: [],
 *      source: null,
 *      range: [0, 34],
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    if (node.declaration) {
        context.write('export ');
        recur(node.declaration);
    } else {
        var rollback = context.transaction();

        // specifiers
        context.write('export ');

        (0, _list.long)(node.specifiers, context, recur, '{}');

        if (context.overflown()) {
            rollback();

            (0, _list.short)(node.specifiers, context, recur, '{}');
        }
    }
}