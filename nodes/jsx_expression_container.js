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
    return '{' + recur(node.expression) + '}';
}
