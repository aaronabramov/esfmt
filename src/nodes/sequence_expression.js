/**
 *    {
 *        type: 'SequenceExpression',
 *        expressions: [{
 *            type: 'AssignmentExpression',
 *            operator: '+=',
 *            left: {
 *                type: 'Identifier',
 *                name: 'x',
 *                range: [43, 44],
 *                loc: {
 *                    start: { line: 4, column: 12 },
 *                    end: { line: 4, column: 13 }
 *                }
 *            },
 *            right: {
 *                type: 'Literal',
 *                value: 10,
 *                raw: '10',
 *                range: [48, 50],
 *                loc: {
 *                    start: { line: 4, column: 17 },
 *                    end: { line: 4, column: 19 }
 *                }
 *            },
 *            range: [43, 50],
 *            loc: {
 *                start: { line: 4, column: 12 },
 *                end: { line: 4, column: 19 }
 *            }
 *        }, {
 *            type: 'Identifier',
 *            name: 'x',
 *            range: [52, 53],
 *            loc: {
 *                start: { line: 4, column: 21 },
 *                end: { line: 4, column: 22 }
 *            }
 *        }],
 *        range: [43, 53],
 *        loc: {
 *            start: { line: 4, column: 12 },
 *            end: { line: 4, column: 22 }
 *        }
 *    }
 */

export function format(node, context, recur) {
    context.write('(');

    for (let i = 0; i < node.expressions.length;) {
        recur(node.expressions[i]);

        if (++i !== node.expressions.length) {
            context.write(', ');
        }
    }

    context.write(')');
}
