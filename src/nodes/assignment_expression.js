/**
 *  { type: 'AssignmentExpression',
 *    operator: '=',
 *    left: { type: 'Identifier', name: 'abc' },
 *    right: { type: 'Identifier', name: 'cde' } }
 */
export function format(node, context, recur) {
    recur(node.left);
    context.write(' ', node.operator, ' ');
    recur(node.right);
}
