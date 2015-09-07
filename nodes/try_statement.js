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
    let result = '';

    result = 'try ' + recur(node.block);

    if (node.handler) {
        result += ' ' + recur(node.handler);
    }

    if (node.finalizer) {
        result += ' finally ' + recur (node.finalizer);
    }

    return result;
}
