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

const WRAP_IN_PARENTHESES = {
    FunctionExpression: true
};

export function format(node, context, recur) {
    let wrapInParentheses = !!WRAP_IN_PARENTHESES[node.callee.type];

    wrapInParentheses && context.write('(');

    recur(node.callee);

    wrapInParentheses && context.write(')');

    let rollback = context.transaction();

    long(node, node.arguments, context, recur, '()');


    if (context.overflown()) {
        rollback();
        short(node, node.arguments, context, recur, '()');
    }
}
