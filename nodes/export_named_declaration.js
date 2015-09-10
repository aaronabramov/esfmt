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
        context.write('export ');
        recur(node.declaration);
    } else {
        // specifiers
        context.write('export {');

        for (let i = 0; i < node.specifiers.length; i++) {
            recur(node.specifiers[i]);
            if (node.specifiers[i + 1]) {
                context.write(', ');
            }
        }

        context.write('}');
    }
}
