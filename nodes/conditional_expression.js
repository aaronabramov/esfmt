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

export function format(node, context, recur) {
    return recur(node.test)
        + ' ? '
        + recur(node.consequent)
        + ' : '
        + recur(node.alternate);
}
