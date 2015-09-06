/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

export function format(node, context, recur) {
    return node.body.map(recur).join('\n') + '\n';
}
