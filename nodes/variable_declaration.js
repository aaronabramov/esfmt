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
    let result = 'var ';

    return 'var ' + node.declarations.map((declaration) => {
        return recur(declaration, context, recur);
    }).join(',\n' + indent) + ';';
}
