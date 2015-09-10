/**
 *  {
 *      type: 'ForInStatement',
 *      left: {
 *          type: 'VariableDeclaration',
 *          declarations: [
 *              [Object]
 *          ],
 *          kind: 'var'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'result'
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      each: false
 *  }
 */

export function format(node, context, recur) {
    context.write('for (');
    recur(node.left);
    context.write(' in ');
    recur(node.right);
    context.write(') ');
    recur(node.body);
}
