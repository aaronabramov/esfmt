/**
 *  {
 *      type: 'CatchClause',
 *      param: {
 *          type: 'Identifier',
 *          name: 'e'
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: []
 *      }
 *  }
 */

export function format(node, context, recur) {
    return 'catch (' + recur(node.param) + ') ' + recur(node.body);
}
