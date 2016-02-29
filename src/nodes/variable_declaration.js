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

    let blockComments = context.blockComments(node);
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
        let previous = node.declarations[i - 1];
        let current = node.declarations[i];
        let next = node.declarations[i + 1];

        context.write(blockComments.printLeading(current, previous));

        if (i > 0) {
            context.write(context.getIndent());
        }

        recur(current);

        if (next) {
            context.write(',');
        }

        context.write(blockComments.printTrailing(current, previous, next));
        if (next) {
            context.write('\n');
        }
    }

    indent && context.indentOut();
}
