/**
 *  {
 *      type: 'ArrayExpression',
 *      elements: [{
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      }, {
 *          type: 'Literal',
 *          value: '2',
 *          raw: '\'2\''
 *      }, {
 *          type: 'Identifier',
 *          name: 'abc'
 *      }, {
 *          type: 'Literal',
 *          value: null,
 *          raw: 'null'
 *      }, {
 *          type: 'Identifier',
 *          name: 'undefined'
 *      }]
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    var rollback = context.transaction();

    (0, _list.long)(node.elements, context, recur, '[]');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.elements, context, recur, '[]');
    };
}