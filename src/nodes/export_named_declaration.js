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

import {long, short} from '../list';

export function format(node, context, recur) {
    if (node.declaration) {
        context.write('export ');
        recur(node.declaration);
    } else {

        // specifiers
        context.write('export ');

        let rollback = context.transaction();

        long(node.specifiers, context, recur, '{}');

        if (context.overflown()) {
            rollback();

            short(node.specifiers, context, recur, '{}');
        }
    }
}
