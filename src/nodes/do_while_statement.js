/**
 *  {
 *      type: 'DoWhileStatement',
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object],
 *              [Object]
 *          ],
 *          range: [3269, 3329]
 *      },
 *      test: {
 *          type: 'BinaryExpression',
 *          operator: '!=',
 *          left: {
 *              type: 'Identifier',
 *              name: 'initialState',
 *              range: [Object]
 *          },
 *          right: {
 *              type: 'MemberExpression',
 *              computed: false,
 *              object: [Object],
 *              property: [Object],
 *              range: [Object]
 *          },
 *          range: [3337, 3366]
 *      },
 *      range: [3266, 3368]
 *  }
 */

export function format(node, context, recur) {
    context.write('do ');
    recur(node.body);
    context.write(' while (');
    recur(node.test);
    context.write(')');
}
