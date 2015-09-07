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
    let result = recur(node.object);

    if (node.computed) {
        result += '[' + recur(node.property) + ']';
    } else {
        result += '.' + recur(node.property);
    }

    return result;
}
