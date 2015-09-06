/**
 *  {
 *      type: 'UnaryExpression',
 *      operator: 'void',
 *      argument: {
 *          type: 'Literal',
 *          value: 0,
 *          raw: '0'
 *      },
 *      prefix: true
 *  }
 */
export function format(node, context, recur) {
    return node.operator + '(' + recur(node.argument) + ')';
}
