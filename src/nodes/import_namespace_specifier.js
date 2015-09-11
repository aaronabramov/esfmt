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
    context.write('* as ');
    recur(node.local);
}
