/**
 *    {
 *        type: 'AssignmentPattern',
 *        left: {
 *            type: 'ArrayPattern',
 *            elements: [{
 *                type: 'Identifier',
 *                name: 'a',
 *                range: [12, 13],
 *                loc: {
 *                    start: { line: 1, column: 12 },
 *                    end: { line: 1, column: 13 }
 *                }
 *            }, {
 *                type: 'Identifier',
 *                name: 'b',
 *                range: [15, 16],
 *                loc: {
 *                    start: { line: 1, column: 15 },
 *                    end: { line: 1, column: 16 }
 *                }
 *            }],
 *            range: [11, 17],
 *            loc: {
 *                start: { line: 1, column: 11 },
 *                end: { line: 1, column: 17 }
 *            }
 *        },
 *        right: {
 *            type: 'ArrayExpression',
 *            elements: [{
 *                type: 'Literal',
 *                value: 1,
 *                raw: '1',
 *                range: [21, 22],
 *                loc: {
 *                    start: { line: 1, column: 21 },
 *                    end: { line: 1, column: 22 }
 *                }
 *            }, {
 *                type: 'Literal',
 *                value: 2,
 *                raw: '2',
 *                range: [24, 25],
 *                loc: {
 *                    start: { line: 1, column: 24 },
 *                    end: { line: 1, column: 25 }
 *                }
 *            }],
 *            range: [20, 26],
 *            loc: {
 *                start: { line: 1, column: 20 },
 *                end: { line: 1, column: 26 }
 *            }
 *        },
 *        range: [11, 26],
 *        loc: {
 *            start: { line: 1, column: 11 },
 *            end: { line: 1, column: 26 }
 *        }
 *    }
 */

export function format(node, context, recur) {
    recur(node.left);
    context.write(' = ');
    recur(node.right);
}
