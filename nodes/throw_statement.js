/**
 *  {
 *      type: 'ThrowStatement',
 *      argument: {
 *          type: 'NewExpression',
 *          callee: {
 *              type: 'Identifier',
 *              name: 'Error',
 *              range: [Object]
 *          },
 *          arguments: [
 *              [Object]
 *          ],
 *          range: [3551, 3577]
 *      },
 *      range: [3545, 3578]
 *  }
 */

export function format(node, context, recur) {
    return 'throw ' + recur(node.argument);
}
