/**
 *  {
 *      type: 'NewExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'Constr'
 *      },
 *      arguments: []
 *  }
 */

import {long, short} from '../list';

export function format(node, context, recur) {
    context.write('new ');
    recur(node.callee);

    let rollback = context.transaction();

    long(node, node.arguments, context, recur, '()');

    if (context.overflown()) {
        rollback();
        short(node, node.arguments, context, recur, '()');
    }
}
