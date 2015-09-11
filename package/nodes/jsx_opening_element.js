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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('<');
    recur(node.name);

    if (node.attributes.length) {
        context.write(' ');

        for (var i = 0; i < node.attributes.length; i++) {
            recur(node.attributes[i]);

            if (node.attributes[i + 1]) {
                context.write(' ');
            }
        }
    };

    if (node.selfClosing) {
        context.write(' /');
    }

    context.write('>');
}