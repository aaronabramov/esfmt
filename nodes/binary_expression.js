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

import * as utils from '../utils';

export function format(node, context, recur) {
    let left = recur(node.left);
    let right = recur(node.right);
    let result = '';

    if (utils.needParentheses(node, node.left)) {
        left = utils.wrapInParantheses(left);
    }

    if (utils.needParentheses(node, node.right)) {
        right = utils.wrapInParantheses(right);
    }

    return left + ' ' + node.operator + ' ' + right;
}
