/**
 * { type: 'Literal', value: 5, raw: '5' }
 */
export function format(node, context) {
    // sometimes literals are parsed with trailing and leading whitespace
    let raw = node.raw.replace(/^\s*/, '').replace(/\s*$/, '');
    context.write(raw);
}
