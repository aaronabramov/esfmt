/**
 *  {
 *      type: 'RestElement',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'args'
 *      }
 *  }
 */
export function format(node, context, recur) {
    context.write('...');
    recur(node.argument);
}
