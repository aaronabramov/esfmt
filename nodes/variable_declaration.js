/**
 *  {
 *      type: 'VariableDeclaration',
 *      declarations: [{
 *          type: 'VariableDeclarator',
 *          id: [Object],
 *          init: [Object]
 *      }],
 *      kind: 'var'
 *  }
 */

export function format(node, context, recur) {
    const indent = new Array(context.config.indentation + 1).join(' ');
    return node.kind + ' ' + node.declarations.map(recur).join(',\n' + indent) + ';';
}
