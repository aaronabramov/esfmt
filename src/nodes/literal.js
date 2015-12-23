/**
 * { type: 'Literal', value: 5, raw: '5' }
 */
export function format(node, context) {
    context.write(node.raw);
}
