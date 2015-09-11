/**
 *  {
 *      type: 'FunctionDeclaration',
 *      id: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }],
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      generator: false,
 *      expression: false
 *  }
 */

import {long, short} from '../list';

export function format(node, context, recur) {
    context.write('function ');
    recur(node.id);

    let rollback = context.transaction();

    long(node.params, context, recur, '()');

    if (context.overflown()) {
        rollback();
        short(node.params, context, recur, '()');
    };

    context.write(' ');
    recur(node.body);
}
