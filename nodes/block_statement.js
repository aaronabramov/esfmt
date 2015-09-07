/**
 *  {
 *      type: 'BlockStatement',
 *      body: [{
 *          type: 'ReturnStatement',
 *          argument: [Object]
 *      }]
 *  }
 */

import * as utils from '../utils';

export function format(node, context, recur) {
    let result = '{';

    if (node.body.length) {
        // to hold previous node
        let previous;

        context.indentIn();
        result += '\n';

        result += node.body.map((child) => {
            let childResult = '';

            if (previous && utils.extraNewLineBetween(previous, child)) {
                childResult += '\n';
            }

            childResult += context.getIndent()
                + recur(child)
                + utils.getLineTerminator(child);

            // current becomev previous
            previous = child;

            return childResult;
        }).join('\n');

        result +='\n';

        context.indentOut();
        result += context.getIndent();

    }

    result += '}';

    return result;
}
