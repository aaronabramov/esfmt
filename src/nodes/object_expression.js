/**
 *  {
 *      type: 'ObjectExpression',
 *      properties: [{
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }, {
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }]
 *  }
 */
import {long, short} from '../list';

export function format(node, context, recur) {
    let rollback = context.transaction();

    long(node, node.properties, context, recur, '{}');

    if (context.overflown()) {
        rollback();
        short(node, node.properties, context, recur, '{}');
    }
}
