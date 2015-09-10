/**
 *  {
 *      type: 'BinaryExpression',
 *      operator: '+',
 *      left: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  }
 */

import * as binary from '../utils/binary';

export function format(node, context, recur) {
    binary.format(node, context, recur);
}
