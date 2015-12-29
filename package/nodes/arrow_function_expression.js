/**
 *  {
 *      type: 'ArrowFunctionExpression',
 *      id: null,
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }],
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      generator: false,
 *      expression: false
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;var _list = require(
'../list');

function format(node, context, recur) {
    // if (node.id) {
    //     context.write(node.id);
    // }

    var rollback = context.transaction();

    (0, _list.long)(node.params, context, recur, '()');
    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.params, context, recur, '()');}


    context.write(' => ');
    recur(node.body);}