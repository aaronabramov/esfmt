/**
 *    {
 *        type: 'YieldExpression',
 *        argument: {
 *            type: 'Literal',
 *            value: 1,
 *            raw: 1,
 *            range: [35, 36],
 *            loc: {
 *                start: { line: 2, column: 10 },
 *                end: { line: 2, column: 11 }
 *            }
 *        },
 *        delegate: false,
 *        range: [29, 36],
 *        loc: {
 *            start: { line: 2, column: 4 },
 *            end: { line: 2, column: 11 }
 *        }
 *    }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
    context.write('yield');

    if (node.delegate) {
        context.write('*');}


    context.write(' ');
    recur(node.argument);}