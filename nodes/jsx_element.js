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
        let i;

        context.indentIn();

        for (i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            let prev = node.children[i - 1];

            if (needLinebreak(child, prev)) {
                result += '\n' + context.getIndent();
            }

            result +=  recur(child);
        }

        if (node.children.length) {
            result += '\n';
        }

        context.indentOut();
        result += recur(node.closingElement);
    }

    return result;
}

function needLinebreak(node, prev) {
    // if it's the first child
    if (!prev) {
        return true;
    }

    // if the previous was a jsx tag. Example:
    //
    // <br />
    // 'abc'
    if (prev && prev.type === 'JSXElement') {
        return true;
    }
}
