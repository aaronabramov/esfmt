/**
 *    {
 *        type: 'ForOfStatement',
 *        left: {
 *            type: 'VariableDeclaration',
 *            declarations: [ [Object] ],
 *            kind: 'let',
 *            range: [ 5, 10 ],
 *            loc: { start: [Object], end: [Object] }
 *        },
 *        right: {
 *            type: 'Identifier',
 *            name: 'b',
 *            range: [ 14, 15 ],
 *            loc: { start: [Object], end: [Object] }
 *        },
 *        body: {
 *            type: 'BlockStatement',
 *            body: [ [Object] ],
 *            range: [ 17, 40 ],
 *            loc: { start: [Object], end: [Object] }
 *        },
 *        range: [ 0, 40 ],
 *        loc: {
 *            start: { line: 1, column: 0 },
 *            end: { line: 3, column: 1 }
 *        }
 *    }
 */

export function format(node, context, recur) {
    context.write('for (');
    recur(node.left);
    context.write(' of ');
    recur(node.right);
    context.write(') ');
    recur(node.body);
}
