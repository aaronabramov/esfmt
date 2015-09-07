/**
 *  {
 *      type: 'ArrowFunctionExpression',
 *      id: null,
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
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
    let result = '';

    if (node.id) {
        result += node.id;
    }

    result += '(' + node.params.map(recur).join(', ') + ') => ';

    result += recur(node.body);

    return result;
}
