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
    var result = recur(node.callee)
    result += '(';
    result += node.arguments.map(recur).join(', ');
    result += ');'

    return result;
}
