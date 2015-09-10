/**
 * { type: 'Identifier', name: 'a' }
 */

export function format(node, context, recur) {
    context.write(node.name);
}
