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
    context.write('[');

    for (let i = 0; i < node.elements.length; i++) {
        recur(node.elements[i]);

        if (node.elements[i + 1]) {
            context.write(', ');
        }
    }

    context.write(']');
}
