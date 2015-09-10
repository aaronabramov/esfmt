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


export function format(node, context, recur) {
    recur(node.expression);
}
