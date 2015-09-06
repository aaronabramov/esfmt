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
    let result = '{';

    if (node.body.length) {
        result += '\n' + context.getIndent()
        + node.body.map(recur).join(context.getIndent())
        + '\n';
    }

    result += '}';

    return result;
}
