/**
 *  {
 *      type: 'NewExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'Constr'
 *      },
 *      arguments: []
 *  }
 */

export function format(node, context, recur) {
    return 'new ' + recur(node.callee) + '('
        + node.arguments.map(recur).join(', ')
        + ');';
}
