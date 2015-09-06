/**
 *    {
 *        type: 'JSXAttribute',
 *        name: {
 *            type: 'JSXIdentifier',
 *            name: 'className'
 *        },
 *        value: {
 *            type: 'Literal',
 *            value: 'abc',
 *            raw: '"abc"'
 *        }
 *    }
 */

export function format(node, context, recur) {
    return recur(node.name) + '=' + recur(node.value);
}
