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

import {long} from '../list';

export function format(node, context, recur) {
    long(node.elements, context, recur, '[]');
}
