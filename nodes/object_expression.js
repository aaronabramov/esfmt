/**
 *  {
 *      type: 'ObjectExpression',
 *      properties: [{
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }, {
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }]
 *  }
 */
export function  format(node, context, recur) {
    let result = '{\n';

    context.indentIn();
    result += context.getIndent();
    result += node.properties.map(recur).join(',\n' + context.getIndent())
    context.indentOut();
    result += '\n}';

    return result;
}
