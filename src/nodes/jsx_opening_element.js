/**
 *  {
 *      type: 'JSXOpeningElement',
 *      name: {
 *          type: 'JSXIdentifier',
 *          name: 'span'
 *      },
 *      selfClosing: false,
 *      attributes: [{ type: 'JSXAttribute', name: [Object], value: [Object] }]
 *  }
 */

export function format(node, context, recur) {
    context.write('<');
    recur(node.name);

    if (node.attributes.length) {
        context.write(' ');

        for (let i = 0; i < node.attributes.length; i++) {
            recur(node.attributes[i]);

            if (node.attributes[i + 1]) {
                context.write(' ');
            }
        }
    }

    if (node.selfClosing) {
        context.write(' /');
    }

    context.write('>');
}
