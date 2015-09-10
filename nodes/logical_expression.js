/**
 *  {
 *      type: 'LogicalExpression',
 *      operator: '||',
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
    let result = '';

    let leftParents = utils.needParentheses(node, node.left);
    let rightParents = utils.needParentheses(node, node.right);

    leftParents && context.write('(');
    recur(node.left);
    leftParents && context.write(')');

    context.write(' ', node.operator, ' ');
    rightParents && context.write('(');
    recur(node.right);
    rightParents && context.write(')');
}
