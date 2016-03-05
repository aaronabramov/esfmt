/**
 *    {
 *        type: 'ObjectPattern',
 *        properties: [{
 *            type: 'Property',
 *            key: {
 *                type: 'Identifier',
 *                name: 'a',
 *                range: [5, 6],
 *                loc: {
 *                    start: { line: 1, column: 5 },
 *                    end: { line: 1, column: 6 }
 *                }
 *            },
 *            value: {
 *                type: 'Identifier',
 *                name: 'b',
 *                range: [8, 9],
 *                loc: {
 *                    start: { line: 1, column: 8 },
 *                    end: { line: 1, column: 9 }
 *                }
 *            },
 *            kind: 'init',
 *            method: false,
 *            shorthand: false,
 *            computed: false,
 *            range: [5, 9],
 *            loc: {
 *                start: { line: 1, column: 5 },
 *                end: { line: 1, column: 9 }
 *            }
 *        }],
 *        range: [4, 10],
 *        loc: {
 *            start: { line: 1, column: 4 },
 *            end: { line: 1, column: 10 }
 *        }
 *    }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;var _list = require(

'../list');

function format(node, context, recur) {
    var rollback = context.transaction();

    (0, _list.long)(node.properties, context, recur, '{}');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.properties, context, recur, '{}');}}