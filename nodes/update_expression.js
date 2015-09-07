/**
 *  {
 *      type: 'UpdateExpression',
 *      operator: '++',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      prefix: false
 *  }
 */

export function format(node, context, recur) {
    if (node.prefix) {
        return node.operator + recur(node.argument);
    } else {
        return recur(node.argument) + node.operator;
    }
}
