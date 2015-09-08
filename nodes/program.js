/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

// TODO: get the comments code out of here

import * as utils from '../utils';
import * as newlines from '../utils/newlines';

export function format(node, context, recur) {
    let result = '';
    let blockComments = context.blockComments(node);

    for (let i =0; i < node.body.length; i++) {
        let previous = node.body[i - 1];
        let child = node.body[i];
        let next = node.body[i + 1];
        let childResult = '';

        if (newlines.extraNewLineBetween(previous, child)) {
            childResult += '\n';
        }

        childResult += blockComments.printLeading(child, previous, next);
        childResult += recur(child) + utils.getLineTerminator(child);
        childResult += blockComments.printTrailing(child, previous, next);

        result += childResult;

        if (next) {
            result += '\n';
        }
    }

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
