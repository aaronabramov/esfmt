/**
 *  {
 *      type: 'TryStatement',
 *      block: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      handler: {
 *          type: 'CatchClause',
 *          param: {
 *              type: 'Identifier',
 *              name: 'e'
 *          },
 *          body: {
 *              type: 'BlockStatement',
 *              body: []
 *          }
 *      },
 *      finalizer: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      }
 *  }
 */

export function format(node, context, recur) {
    context.write('try ');
    recur(node.block);

    if (node.handler) {
        context.write(' ');
        recur(node.handler);
    }

    if (node.finalizer) {
        context.write(' finally ');
        recur(node.finalizer);
    }
}
