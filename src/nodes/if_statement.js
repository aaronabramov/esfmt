/**
 *  {
 *      type: 'IfStatement',
 *      test: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      consequent: {
 *          type: 'ReturnStatement',
 *          argument: {
 *              type: 'Literal',
 *              value: 5,
 *              raw: '5'
 *          }
 *      },
 *      alternate: null
 *  }
 */

import * as utils from '../line_terminator';

export function format(node, context, recur) {
    context.write('if (');
    recur(node.test);
    context.write(') ');

    if (node.consequent.type !== 'BlockStatement') {
        context.write('{\n');
        context.indentIn();
        context.write(context.getIndent());
        recur(node.consequent)
        context.write(utils.getLineTerminator(node.consequent), '\n');

        context.indentOut();
        context.write(context.getIndent(), '}');
    } else {
        recur(node.consequent);
    }

    if (node.alternate) {
        context.write(' else ');
        recur(node.alternate);
    }
}
