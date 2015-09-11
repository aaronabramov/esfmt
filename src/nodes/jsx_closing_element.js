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
    context.write('</');
    recur(node.name);
    context.write('>');
}
