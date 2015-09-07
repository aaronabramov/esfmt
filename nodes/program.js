/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

import * as utils from '../utils';
import * as newlines from '../utils/newlines';

export function format(node, context, recur) {
    let previous;

    let result = node.body.map((child) => {
        let childResult = '';

        if (newlines.extraNewLineBetween(previous, child)) {
            childResult += '\n';
        }

        childResult += recur(child) + utils.getLineTerminator(child);
        previous = child;

        return childResult;
    }).join('\n');

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
