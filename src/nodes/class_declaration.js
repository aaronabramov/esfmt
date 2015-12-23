/**
 *  {
 *     type: 'ClassDeclaration',
 *     id: {
 *         type: 'Identifier',
 *         name: 'ABC',
 *         range: [6, 9],
 *         loc: {
 *             start: [Object],
 *             end: [Object]
 *         }
 *     },
 *     superClass: {
 *         type: 'MemberExpression',
 *         computed: false,
 *         object: {
 *             type: 'Identifier',
 *             name: 'React',
 *             range: [Object],
 *             loc: [Object]
 *         },
 *         property: {
 *             type: 'Identifier',
 *             name: 'Component',
 *             range: [Object],
 *             loc: [Object]
 *         },
 *         range: [18, 33],
 *         loc: {
 *             start: [Object],
 *             end: [Object]
 *         }
 *     },
 *     body: {
 *         type: 'ClassBody',
 *         body: [
 *             [Object],
 *             [Object],
 *             [Object]
 *         ],
 *         range: [34, 140],
 *         loc: {
 *             start: [Object],
 *             end: [Object]
 *         }
 *     },
 * }
 */

export function format(node, context, recur) {
    context.write('class ');
    recur(node.id);

    if (node.superClass) {
        context.write(' extends ');
        recur(node.superClass);
    }

    context.write(' ');
    recur(node.body);
}
