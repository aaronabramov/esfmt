/**
 *    {
 *        type: 'WhileStatement',
 *        test: {
 *            type: "Literal",
 *            value: false,
 *            raw: false,
 *            range: [7, 12],
 *            loc: {
 *                start: { line: 1, column: 7 },
 *                end: { line: 1, column: 12 }
 *            }
 *        },
 *        body: {
 *            type: "BlockStatement",
 *            body: [{
 *                type: "BreakStatement",
 *                label: null,
 *                range: [21, 26],
 *                loc: {
 *                    start: { line: 2, column: 4 },
 *                    end: { line: 2, column: 10 }
 *                }
 *            }],
 *            range: [14, 28],
 *            loc: {
 *                start: {
 *                    line: 1,
 *                    column: 14
 *                },
 *                end: {
 *                    line: 3,
 *                    column: 1
 *                }
 *            }
 *        },
 *        range: [0, 28],
 *        loc: {
 *            start: { line: 1, column: 0 },
 *            end: { line: 3, column: 1 }
 *        }
 *    }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
  context.write('while (');
  recur(node.test);
  context.write(') ');
  recur(node.body);}