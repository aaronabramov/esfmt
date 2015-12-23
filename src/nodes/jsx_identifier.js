/**
 * { type: 'JSXIdentifier', name: 'div' }
 */

export function format(node, context) {
    context.write(node.name);
}
