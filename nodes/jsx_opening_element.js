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
    let result = '';

    result += '<' + recur(node.name);

    if (node.attributes.length) {
        result += ' ';
        result += node.attributes.map(recur).join(' ');
    };

    if (node.selfClosing) {
        result += ' /';
    }

    result += '>';

    return result;
}
