/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

export function format(node, context, recur) {
    return node.body.map((child) => {
        return recur(child, context, recur);
    }).join('\n') + '\n';
}
