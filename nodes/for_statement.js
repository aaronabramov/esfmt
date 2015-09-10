/**
 *  {
 *      type: 'ForStatement',
 *      init: {
 *          type: 'VariableDeclaration',
 *          declarations: [
 *              [Object]
 *          ],
 *          kind: 'var'
 *      },
 *      test: {
 *          type: 'BinaryExpression',
 *          operator: '<=',
 *          left: {
 *              type: 'Identifier',
 *              name: 'i'
 *          },
 *          right: {
 *              type: 'Literal',
 *              value: 555,
 *              raw: '555'
 *          }
 *      },
 *      update: {
 *          type: 'UpdateExpression',
 *          operator: '++',
 *          argument: {
 *              type: 'Identifier',
 *              name: 'i'
 *          },
 *          prefix: true
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      }
 *  }
 */

export function format(node, context, recur) {
    context.write('for (');
    recur(node.init);
    context.write('; ');
    recur(node.test);
    context.write('; ');
    recur(node.update);
    context.write(') ');
    recur(node.body);
}
