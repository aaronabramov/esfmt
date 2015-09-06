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
    let result = '{';

    if (node.body.length) {
        context.indentIn();

        result += '\n';

        result += node.body.map((child) => {
            return context.getIndent()
                + recur(child)
                + context.getLineTerminator(child);
        }).join('\n');

        result +='\n';

        context.indentOut();
        result += context.getIndent();
    }

    result += '}';

    return result;
}
