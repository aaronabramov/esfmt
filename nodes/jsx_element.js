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

    result = recur(node.openingElement);

    if (node.closingElement) {
        context.indentIn();

        node.children.forEach((child) => {
            result += '\n' + context.getIndent() + recur(child);
        });

        if (node.children.length) {
            result += '\n';
        }

        context.indentOut();
        result += recur(node.closingElement);
    }

    return result;
}

