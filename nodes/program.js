/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */
import {format as formatBlock} from '../utils/block';

export function format(node, context, recur) {
    formatBlock(node, context, recur);
    if (context.config.newLineAtTheEnd) {
        context.write('\n');
    }
};
