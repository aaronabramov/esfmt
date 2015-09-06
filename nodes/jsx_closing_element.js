/**
 *  {
 *      type: 'JSXClosingElement',
 *      name: {
 *          type: 'JSXIdentifier',
 *          name: 'div'
 *      }
 *  }
 */

export function format(node, context, recur) {
    return '</' + recur(node.name) + '>';
}
