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
    recur(node.name);
    context.write('=');
    recur(node.value);
}
