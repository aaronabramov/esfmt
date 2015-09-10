/**
 *  {
 *      type: 'ExportSpecifier',
 *      exported: {
 *          type: 'Identifier',
 *          name: 'a',
 *          range: [8, 9],
 *          loc: {
 *              start: [Object],
 *              end: [Object]
 *          }
 *      },
 *      local: {
 *          type: 'Identifier',
 *          name: 'a',
 *          range: [8, 9],
 *          loc: {
 *              start: [Object],
 *              end: [Object]
 *          }
 *      },
 *      range: [8, 9],
 *  }
 */

export function format(node, context, recur) {
    if (node.exported.name === node.local.name) {
        recur(node.exported);
    } else {
        recur(node.local);
        context.write(' as ');
        recur(node.exported);
    }
}
