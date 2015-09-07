/**
 *  {
 *      type: 'ImportSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'b'
 *      },
 *      imported: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  } {
 *      type: 'ImportSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'd'
 *      },
 *      imported: {
 *          type: 'Identifier',
 *          name: 'c'
 *      }
 *  }
 */

export function format(node, context, recur) {
    if (node.local.name === node.imported.name) {
        return recur(node.local);
    } else {
        return recur(node.imported) + ' as ' + recur(node.local);
    }
}
