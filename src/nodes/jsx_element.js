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
    recur(node.openingElement);

    if (node.closingElement) {
        let i;
        // Don't print literals that have only whitespace
        let elements = node.children.filter(notWhitespaceLiteral);


        context.indentIn();

        for (i = 0; i < elements.length; i++) {
            let child = elements[i];

            context.write('\n', context.getIndent());
            recur(child);
        }

        // the last linebreak
        if (elements.length) {
            context.write('\n');
        }

        context.indentOut();
        context.write(context.getIndent());
        recur(node.closingElement);
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
