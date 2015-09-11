/**
 *  {
 *      type: 'ExpressionStatement',
 *      expression: {
 *          type: 'CallExpression', // AssignmentExpression
 *          callee: {
 *              type: 'Identifier',
 *              name: 'abc'
 *          },
 *          arguments: [
 *              [Object],
 *              [Object]
 *          ]
 *      }
 *  }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.expression);
}