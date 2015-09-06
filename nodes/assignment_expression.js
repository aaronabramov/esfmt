/**
 *  { type: 'AssignmentExpression',
 *    operator: '=',
 *    left: { type: 'Identifier', name: 'abc' },
 *    right: { type: 'Identifier', name: 'cde' } }
 */
export function format(node, context, recur) {
    return recur(node.left) + ' ' + node.operator + ' ' + recur(node.right);
}
