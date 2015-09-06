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
    let result = recur(node.id) + ' = ' + recur(node.init);

    return result;
}
