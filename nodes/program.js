/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

export function format(node, context, recur) {
    let result = node.body.map(recur).join(';\n') + ';';

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
