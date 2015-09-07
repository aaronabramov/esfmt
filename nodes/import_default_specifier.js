/**
 *   {
 *      type: 'ImportDefaultSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'A'
 *      }
 *  }
 */

export function format(node, context, recur) {
    return recur(node.local);
}
