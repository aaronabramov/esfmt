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
        return node.operator + '(' + recur(node.argument) + ')';
    } else if (node.operator === 'typeof'){
        return node.operator + ' ' + recur(node.argument);
    } else {
        return node.operator + recur(node.argument);
    }

}
