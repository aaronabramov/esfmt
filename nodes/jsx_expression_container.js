/**
 *  {
 *      type: 'JSXExpressionContainer',
 *      expression: {
 *          type: 'Identifier',
 *          name: 'test'
 *      }
 *  }
 */
export function format(node, context, recur) {
    context.write('{');
    recur(node.expression);
    context.write('}');
}
