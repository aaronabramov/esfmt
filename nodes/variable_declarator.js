/**
 *  {
 *      type: 'VariableDeclarator',
 *      id: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      init: {
 *          type: 'Literal',
 *          value: 5,
 *          raw: '5'
 *      }
 *  }
 */

export function format(node, context, recur) {
    recur(node.id);

    if (node.init) {
        context.write(' = ');
        recur(node.init);
    }
}
