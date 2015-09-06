/**
 *  {
 *      type: 'JSXElement',
 *      openingElement: {
 *          type: 'JSXOpeningElement',
 *          name: {
 *              type: 'JSXIdentifier',
 *              name: 'div'
 *          },
 *          selfClosing: false,
 *          attributes: []
 *      },
 *      closingElement: {
 *          type: 'JSXClosingElement',
 *          name: {
 *              type: 'JSXIdentifier',
 *              name: 'div'
 *          }
 *      },
 *      children: []
 *  }
 */

export function format(node, context, recur) {
    let result = '';

    if (node.closingElement) {
        result += recur(node.openingElement);
        if (node.children) {
            result += node.children.map((child) => {
                return recur(child);
            }).join('');

        }

        result += recur(node.closingElement);
    }

    return result;
}

