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

import * as utils from '../utils';

export function format(node, context, recur) {
    let result = 'if (' + recur(node.test) + ') ';

    if (node.consequent.type !== 'BlockStatement') {
        result += '{\n';
        context.indentIn();
        result += context.getIndent()
            + recur(node.consequent)
            + utils.getLineTerminator(node.consequent)
            + '\n';

        context.indentOut();
        result += context.getIndent() + '}';
    } else {
        result += recur(node.consequent);
    }

    if (node.alternate) {
        result += ' else ' + recur(node.alternate);
    }

    return result;
}
