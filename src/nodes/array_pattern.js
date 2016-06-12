/**
 *  {
 *      type: 'ArrayPattern',
 *      elements: [{
 *          type: 'Identifier',
 *          name: 'a',
 *          range: [Object],
 *          loc: [Object]
 *      }, {
 *          type: 'Identifier',
 *          name: 'b',
 *          range: [Object],
 *          loc: [Object]
 *      }],
 *      range: [ 4, 10 ],
 *      loc: {
 *          start: {
 *              line: 1,
 *              column: 4
 *          },
 *          end: {
 *              line: 1,
 *              column: 10
 *          }
 *      }
 *  }
 */

import {long, short} from '../list';

export function format(node, context, recur) {
    let rollback = context.transaction();

    long(node, node.elements, context, recur, '[]');

    if (context.overflown()) {
        rollback();
        short(node, node.elements, context, recur, '[]');
    }
}
