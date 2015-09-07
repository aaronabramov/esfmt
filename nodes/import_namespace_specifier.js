/**
 *  {
 *      type: 'ImportNamespaceSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'A'
 *      }
 *  }
 */

export function format(node, context, recur) {
    return '* as ' + recur(node.local);
}
