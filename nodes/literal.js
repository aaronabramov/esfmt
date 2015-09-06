/**
 * { type: 'Literal', value: 5, raw: '5' }
 */

export function format(node, context, recur) {
    return node.raw;
}
