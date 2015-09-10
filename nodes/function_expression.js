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
    context.write('function');

    if (node.id) {
        context.write(' ');
        recur(node.id);
    }

    context.write('(');

    for (let i = 0; i < node.params.length; i++) {
        recur(node.params[i]);

        if (node.params[i + 1]) {
            context.write(', ');
        }
    }

    context.write(') ');
    recur(node.body);
}
