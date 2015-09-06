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
    return 'return ' + recur(node.argument);
}
