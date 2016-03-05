/**
 *    {
 *        type: 'ExperimentalSpreadProperty',
 *        argument: {
 *            type: 'Identifier',
 *            name: 'b',
 *            range: [17, 18],
 *            loc: {
 *                start: { line: 2, column: 7 },
 *                end: { line: 2, column: 8 }
 *            }
 *        },
 *        range: [14, 18],
 *        loc: {
 *            start: { line: 2, column: 4 },
 *            end: { line: 2, column: 8 }
 *        }
 *    }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
  context.write('...');
  recur(node.argument);}