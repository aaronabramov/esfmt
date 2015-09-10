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
export function format(node, context, recur) {
    recur(node.callee)
    context.write('(');

    for (let i = 0; i < node.arguments.length; i++) {
        recur(node.arguments[i]);

        if (node.arguments[i + 1]) {
            context.write(', ');
        }
    }

    context.write(')');
}
