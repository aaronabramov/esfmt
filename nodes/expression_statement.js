/**
 *  {
 *      type: 'ExpressionStatement',
 *      expression: {
 *          type: 'CallExpression',
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

export function format(node, context, recur) {
    return recur(node.expression);
}
