/**
 *  {
 *      type: 'ArrayPattern',
 *      elements: [{
 *          type: 'Identifier',
 *          name: 'a',
 *          range: [Object],
 *          loc: [Object]
 *      }, {
 *          type: 'Identifier',
 *          name: 'b',
 *          range: [Object],
 *          loc: [Object]
 *      }],
 *      range: [ 4, 10 ],
 *      loc: {
 *          start: {
 *              line: 1,
 *              column: 4
 *          },
 *          end: {
 *              line: 1,
 *              column: 10
 *          }
 *      }
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;var _list = require(

'../list');

function format(node, context, recur) {
    var rollback = context.transaction();

    (0, _list.long)(node.elements, context, recur, '[]');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.elements, context, recur, '[]');}}