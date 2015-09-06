/**
 *  {
 *      type: 'FunctionExpression',
 *      id: null,
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

export function format(node, context, recur) {
    return 'function(' + node.params.map(recur).join(', ') + ') '
        + recur(node.body);
}
