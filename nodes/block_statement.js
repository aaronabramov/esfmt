/**
 *  {
 *      type: 'BlockStatement',
 *      body: [{
 *          type: 'ReturnStatement',
 *          argument: [Object]
 *      }]
 *  }
 */

import {format as formatBlock} from '../utils/block';

export function format(node, context, recur) {
    if (!node.body.length) {
        return '{}';
    }

    let result = '{\n';

    context.indentIn();
    result += formatBlock(node, context, recur);
    context.indentOut();

    result += '\n' + context.getIndent() + '}';

    return result;
}
