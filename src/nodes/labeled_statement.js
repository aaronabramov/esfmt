/**
 *    {
 *        type: 'LabeledStatement',
 *        label: {
 *            type: 'Identifier',
 *            name: 'loop1',
 *            range: [0, 5],
 *            loc: {
 *                start: { line: 1, column: 0 },
 *                end: { line: 1, column: 5 }
 *            }
 *        },
 *        body: [Object],
 *        range: [0, 189],
 *        loc: {
 *            start: { line: 1, column: 0 },
 *            end: { line: 10, column: 1 }
 *        }
 *    }
 */

export function format(node, context, recur) {
    context.write(node.label.name);
    context.write(':');
    context.write('\n');
    context.write(context.getIndent());
    recur(node.body);
}
