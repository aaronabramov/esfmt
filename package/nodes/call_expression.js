/**
 *  {
 *      type: 'CallExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      arguments: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }]
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;var _list = require(

'../list');

var WRAP_IN_PARENTHESES = { 
    FunctionExpression: true };


function format(node, context, recur) {
    var wrapInParentheses = !!WRAP_IN_PARENTHESES[node.callee.type];

    wrapInParentheses && context.write('(');

    recur(node.callee);

    wrapInParentheses && context.write(')');

    var rollback = context.transaction();

    (0, _list.long)(node.arguments, context, recur, '()');


    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.arguments, context, recur, '()');}}