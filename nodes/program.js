/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

// TODO: get the comments code out of here

// import * as utils from '../utils';
// import * as newlines from '../utils/newlines';

import {format as formatBlock} from '../utils/block';

export function format(node, context, recur) {
    formatBlock(node, context, recur);

    if (context.config.newLineAtTheEnd) {
        context.write('\n');
    }
}
