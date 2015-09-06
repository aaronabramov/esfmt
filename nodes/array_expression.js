/**
 *  {
 *      type: 'ArrayExpression',
 *      elements: [{
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      }, {
 *          type: 'Literal',
 *          value: '2',
 *          raw: '\'2\''
 *      }, {
 *          type: 'Identifier',
 *          name: 'abc'
 *      }, {
 *          type: 'Literal',
 *          value: null,
 *          raw: 'null'
 *      }, {
 *          type: 'Identifier',
 *          name: 'undefined'
 *      }]
 *  }
 */
export function format(node, context, recur) {
    return '[' + node.elements.map(recur).join(', ') + ']';
}
