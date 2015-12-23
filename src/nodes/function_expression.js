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

/**
 * @param {Boolean} noFunctionKeyword if set to true, then `function` will not be printed.
 *  in class definitions the `constructor` is defined in the class itself, and the function
 *  declaration is expected to be just `() {}`
 *
 *      class A {
 *          constructor() {
 *          }
 *      }
 */
export function format(node, context, recur, {noFunctionKeyword} = {}) {
    if (!noFunctionKeyword) {
        context.write('function');
    }

    if (node.id) {
        context.write(' ');
        recur(node.id);
    }

    let rollback = context.transaction();

    long(node.params, context, recur, '()');

    if (context.overflown()) {
        rollback();
        short(node.params, context, recur, '()');
    }

    context.write(' ');
    recur(node.body);
}
