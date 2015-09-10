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

    if (node.id) {
        context.write(node.id);
    }

    context.write('(')

    for (let i = 0; i < node.params.length; i++) {
        recur(node.params[i]);

        if (node.params[i + 1]) {
            context.write(', ');
        }
    }

    context.write(') => ');
    recur(node.body);
}
