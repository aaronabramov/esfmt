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
        context.write(node.operator);
        recur(node.argument);
    } else {
        recur(node.argument);
        context.write(node.operator);
    }
}
