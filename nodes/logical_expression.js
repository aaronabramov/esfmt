/**
 *  {
 *      type: 'LogicalExpression',
 *      operator: '||',
 *      left: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  }
 */

export function format(node, context, recur) {
    return recur(node.left)
        + ' '
        + node.operator
        + ' '
        + recur(node.right);
}
