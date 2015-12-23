/**
 * { type: 'Identifier', name: 'a' }
 */

export function format(node, context) {
    context.write(node.name);
}
