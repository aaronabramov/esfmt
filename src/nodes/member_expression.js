/**
 *  {
 *      type: 'MemberExpression',
 *      computed: false,
 *      object: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      property: {
 *          type: 'Identifier',
 *          name: 'bc'
 *      }
 *  }
 */
export function format(node, context, recur) {
    recur(node.object);
    if (node.computed) {
        context.write('[');
        recur(node.property);
        context.write(']');
    } else {
        context.write('.');
        recur(node.property);
    }
};
