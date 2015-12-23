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
    context.write(node.kind, ' ');
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
    for (let i = 0; i < node.declarations.length; i++) {
        recur(node.declarations[i]);
        if (node.declarations[i + 1]) {
            context.write(',\n', context.getIndent());
        }
    }

    indent && context.indentOut();
}
