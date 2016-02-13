/**
 *    {
 *        type: 'TaggedTemplateExpression',
 *        tag: {
 *            type: 'Identifier',
 *            name: 'tag',
 *            range: [0, 3],
 *            loc: {
 *                start: { line: 1, column: 0 },
 *                end: { line: 1,column: 3 }
 *            }
 *        },
 *        quasi: {
 *            type: 'TemplateLiteral',
 *            quasis: [{
 *                type: 'TemplateElement',
 *                value: { raw: 'abc', cooked: 'abc' },
 *                tail :false,
 *                range: [3, 9],
 *                loc: {
 *                    start: { line: 1, column: 3},
 *                    end: { line: 1, column: 9 }
 *                }
 *            }, {
 *                type: 'TemplateElement',
 *                value: { raw: 'a', cooked: 'a' }
 *                tail: false,
 *                range: [10, 14],
 *                loc: {
 *                    start: { line: 1, column: 10 },
 *                    end: { line: 1, column: 14 }
 *                }
 *            }, {
 *                type: 'TemplateElement',
 *                value: { raw:'', cooked: '' },
 *                tail: true,
 *                range: [15, 17],
 *                loc: {
 *                    start: { line: 1, column: 15 },
 *                    end: { line: 1, column: 17 }
 *                }
 *            }],
 *            expressions: [{
 *                type: 'Identifier',
 *                name: 'b',
 *                range: [9, 10],
 *                loc: {
 *                    start: { line: 1, column: 9 },
 *                    end: { line: 1, column: 10 }
 *                }
 *            }, {
 *                type:'Identifier',
 *                name: 'd',
 *                range: [14, 15],
 *                loc: {
 *                    start: { line: 1, column: 14 },
 *                    end: { line: 1, column: 15 }
 *                }
 *            }],
 *            range: [3, 17],
 *            loc: {
 *                start: { line: 1, column: 3 },
 *                end:{ line: 1, column: 17 }
 *            }
 *        },
 *        range: [0, 17],
 *        loc: {
 *            start: { line: 1, column: 0 },
 *            end: { line: 1, column: 17 }
 *        }
 *    }
 */

export function format(node, context, recur) {
    context.write(node.tag.name);
    recur(node.quasi);
}
