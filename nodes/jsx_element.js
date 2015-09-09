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

    // console.log(node);

    result = recur(node.openingElement);

    if (node.closingElement) {
        let i;
        // Don't print literals that have only whitespace
        let elements = node.children.filter(notWhitespaceLiteral);


        context.indentIn();

        for (i = 0; i < elements.length; i++) {
            let child = elements[i];
            let prev = elements[i - 1];

            if (needLinebreak(child, prev)) {
                result += '\n' + context.getIndent();
            }

            result +=  recur(child);
        }

        // the last linebreak
        if (elements.length) {
            result += '\n';
        }

        context.indentOut();
        result += context.getIndent() + recur(node.closingElement);
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

/**
 * JSX contents are parsed as a bunch of whitespace literals
 * for example the following structure
 *  <div>
 *      <App />
 *  </div>
 *
 * Will have childre elements
 *  1. "\n    "
 *  2. <App />
 *  3. "\n"
 *
 * We want to reformat it, so we strip down all whitespaces, so that
 * we can add them later in the right order with correct indentation.
 */
function notWhitespaceLiteral(node) {
    if (node.type === 'Literal') {
        return !node.raw.match(/^\s+$/);
    }

    return true;
}
