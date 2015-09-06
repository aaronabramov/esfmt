/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

export function format(node, context, recur) {
    let result = node.body.map((child) => {
        return recur(child) + context.getLineTerminator(child);
    }).join('\n');

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
