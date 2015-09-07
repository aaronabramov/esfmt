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
    return 'for (' + recur(node.left) + ' in '
        + recur(node.right) + ') ' + recur(node.body);
}
