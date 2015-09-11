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
        return context.write('{}');
    }

    context.write('{\n');
    context.indentIn();
    formatBlock(node, context, recur);
    context.indentOut();
    context.write('\n', context.getIndent(), '}');
};
