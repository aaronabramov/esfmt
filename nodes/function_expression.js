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

export function format(node, context, recur) {
    let result = 'function';

    if (node.id) {
        result += ' ' + recur(node.id);
    }

    result += '(' + node.params.map(recur).join(', ') + ') '
        + recur(node.body);

    return result;
}
