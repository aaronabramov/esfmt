/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

export function format(node, context, recur) {
    let previous;

    let result = node.body.map((child) => {
        let childResult = '';

        if (context.extraNewLineBetween(previous, child)) {
            childResult += '\n';
        }

        childResult += recur(child) + context.getLineTerminator(child);
        previous = child;

        return childResult;
    }).join('\n');

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
