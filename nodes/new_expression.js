/**
 *  {
 *      type: 'NewExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'Constr'
 *      },
 *      arguments: []
 *  }
 */

export function format(node, context, recur) {
    context.write('new ');
    recur(node.callee);
    context.write('(');

    for (let i = 0; i < node.arguments.length; i++) {
        recur(node.arguments[i]);

        if (node.arguments[i + 1]) {
            context.write(', ');
        }

    }

    context.write(')');
}
