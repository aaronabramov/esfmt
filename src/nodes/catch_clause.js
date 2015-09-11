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
    context.write('catch (');
    recur(node.param);
    context.write(') ');
    recur(node.body);
}
