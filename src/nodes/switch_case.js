/**
 *  {
 *      type: 'SwitchCase',
 *      test: null,
 *      consequent: [{
 *          type: 'ReturnStatement',
 *          argument: [Object]
 *      }]
 *  }
 */

import {getLineTerminator} from '../line_terminator';

export function format(node, context, recur) {
    if (node.test) {
        context.write('case ');
        recur(node.test);
        context.write(':');
    } else {
        context.write('default:');
    }

    context.indentIn();

    for (let i = 0; i < node.consequent.length; i++) {
        context.write('\n', context.getIndent());
        recur(node.consequent[i]);

        context.write(getLineTerminator(node.consequent[i]));
    }

    context.indentOut();
}
