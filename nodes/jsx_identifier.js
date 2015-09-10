/**
 * { type: 'JSXIdentifier', name: 'div' }
 */

export function format(node, context, recur) {
    context.write(node.name);
}
