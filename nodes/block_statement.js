/**
 *  {
 *      type: 'BlockStatement',
 *      body: [{
 *          type: 'ReturnStatement',
 *          argument: [Object]
 *      }]
 *  }
 */
export function format(node, context, recur) {
    context.indentIn();
    return '{'
        + '\n' + context.getIndent()
        + node.body.map(recur).join(context.getIndent())
        + '\n}';
}
