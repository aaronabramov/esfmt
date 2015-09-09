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

import * as utils from '../utils';

export function  format(node, context, recur) {
    if (!node.properties.length) {
        return '{}';
    }

    let blockComments = context.blockComments(node);
    let result = '{\n';

    context.indentIn();

    for (let i =0; i < node.properties.length; i++) {
        let previous = node.properties[i - 1];
        let child = node.properties[i];
        let next = node.properties[i + 1];
        let childResult = '';

        childResult += blockComments.printLeading(child, previous, next);
        childResult += context.getIndent() + recur(child);

        if (next) {
            childResult += ','
        }

        childResult += blockComments.printTrailing(child, previous, next);

        result += childResult;

        if (next) {
            result += '\n';
        }
    }

    context.indentOut();
    result += '\n' + context.getIndent() + '}';

    return result;
}
