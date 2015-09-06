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
    return recur(node.object) + '.' + recur(node.property);
}
