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
 */

import {long, short} from '../list';

export function format(node, context, recur) {
    let rollback = context.transaction();

    long(node, node.properties, context, recur, '{}');

    if (context.overflown()) {
        rollback();
        short(node, node.properties, context, recur, '{}');
    }
}
