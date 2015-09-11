/**
 *  {
 *      type: 'NewExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'Constr'
 *      },
 *      arguments: []
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    context.write('new ');
    recur(node.callee);

    var rollback = context.transaction();

    (0, _list.long)(node.arguments, context, recur, '()');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.arguments, context, recur, '()');
    };
}