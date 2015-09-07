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
        // to hold previous node
        let previous;

        context.indentIn();
        result += '\n';

        result += node.body.map((child) => {
            let childResult = context.getIndent();

            if (previous && context.extraNewLineBefore(previous)) {
                childResult += '\n';
            }

            childResult += recur(child)
                + context.getLineTerminator(child);

            // current becomev previous
            previous = child;

            return childResult;
        }).join('\n');

        result +='\n';

        context.indentOut();
        result += context.getIndent();

    }

    result += '}';

    return result;
}
