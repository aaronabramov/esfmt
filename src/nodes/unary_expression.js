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
    if (node.operator === 'void') {
        context.write(node.operator, '(');
        recur(node.argument);
        context.write(')');
    } else if (node.operator === 'typeof' || node.operator === 'delete') {
        context.write(node.operator, ' ');
        recur(node.argument);
    } else {
        context.write(node.operator);
        recur(node.argument);
    }
}
