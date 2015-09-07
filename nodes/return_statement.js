/**
 *    argument: {
 *        type: 'BinaryExpression',
 *        operator: '+',
 *        left: {
 *            type: 'Identifier',
 *            name: 'a'
 *        },
 *        right: {
 *            type: 'Identifier',
 *            name: 'b'
 *        }
 *    }
 *    }
 */

export function format(node, context, recur) {
    let result = 'return';

    if (node.argument) {
        result += ' ' + recur(node.argument);
    }

    return result;
}
