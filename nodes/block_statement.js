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

    // if (node.body.length) {
    //     // to hold previous node
    //     let previous;
    //
    //     context.indentIn();
    //     result += '\n';
    //
    //     result += node.body.map((child) => {
    //         let childResult = '';
    //
    //         if (previous && newlines.extraNewLineBetween(previous, child)) {
    //             childResult += '\n';
    //         }
    //
    //         childResult += context.getIndent()
    //             + recur(child)
    //             + utils.getLineTerminator(child);
    //
    //         // current becomev previous
    //         previous = child;
    //
    //         return childResult;
    //     }).join('\n');
    //
    //     result +='\n';
    //
    //     context.indentOut();
    //     result += context.getIndent();
    //
    // }

    result += '\n' + context.getIndent() + '}';

    return result;
}
