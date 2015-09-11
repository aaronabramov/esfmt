/**
 *  {
 *      type: 'ConditionalExpression',
 *      test: {
 *          type: 'LogicalExpression',
 *          operator: '||',
 *          left: {
 *              type: 'Identifier',
 *              name: 'a'
 *          },
 *          right: {
 *              type: 'Identifier',
 *              name: 'b'
 *          }
 *      },
 *      consequent: {
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      },
 *      alternate: {
 *          type: 'Literal',
 *          value: true,
 *          raw: 'true'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.test);
  context.write(' ? ');
  recur(node.consequent);
  context.write(' : ');
  recur(node.alternate);
}