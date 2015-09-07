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

const DONT_INDENT = {
    FunctionDeclaration: true
};

export function format(node, context, recur) {
    let result = node.kind + ' ';
    var indent = true;

    /**
     * If var declaration consists of one element and it's a function
     * it should not be indented
     * Example:
     *  let a = function() {
     *      return 1;
     *  };
     */
    if (node.declarations.length === 1) {
        indent = !!DONT_INDENT[node.declarations[0].type];

    }

    indent && context.indentIn();

    result += node.declarations
        .map(recur)
        .join(',\n' + context.getIndent());

    indent && context.indentOut();

    return result;
}
