/**
 *  {
 *      type: 'ArrayExpression',
 *      elements: [{
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      }, {
 *          type: 'Literal',
 *          value: '2',
 *          raw: '\'2\''
 *      }, {
 *          type: 'Identifier',
 *          name: 'abc'
 *      }, {
 *          type: 'Literal',
 *          value: null,
 *          raw: 'null'
 *      }, {
 *          type: 'Identifier',
 *          name: 'undefined'
 *      }]
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
