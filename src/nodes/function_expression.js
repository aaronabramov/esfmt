/**
 *  {
 *      type: 'FunctionExpression',
 *      id: { type: 'Identifier', name: 'fn' },
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
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
    context.write('function');

    if (node.id) {
        context.write(' ');
        recur(node.id);
    }

    let rollback = context.transaction();

    long(node.params, context, recur, '()');

    if (context.overflown()) {
        rollback();
        short(node.params, context, recur, '()');
    };

    context.write(' ');
    recur(node.body);
}
