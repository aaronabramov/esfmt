/**
 *  {
 *      type: 'CallExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      arguments: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }]
 *  }
 */

import {long, short} from '../list';

export function format(node, context, recur) {
    recur(node.callee);

    let rollback = context.transaction();

    long(node.arguments, context, recur, '()');


    if (context.overflown()) {
        rollback();
        short(node.arguments, context, recur, '()');
    }
}
