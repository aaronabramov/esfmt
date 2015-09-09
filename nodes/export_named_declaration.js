/**
 *  {
 *      type: 'ExportNamedDeclaration',
 *      declaration: {
 *          type: 'FunctionDeclaration',
 *          id: {
 *              type: 'Identifier',
 *              name: 'abc',
 *          },
 *          params: [],
 *          body: {
 *              type: 'BlockStatement',
 *              body: [Object],
 *          },
 *          generator: false,
 *          expression: false,
 *      },
 *      specifiers: [],
 *      source: null,
 *      range: [0, 34],
 *  }
 */
export function format(node, context, recur) {
    if (node.declaration) {
        return 'export ' + recur(node.declaration);
    } else {
        // specifiers
        return 'export {' + node.specifiers.map(recur).join(', ') + '}';
    }
}
