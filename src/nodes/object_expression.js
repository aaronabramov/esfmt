/**
 *  {
 *      type: 'ObjectExpression',
 *      properties: [{
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }, {
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }]
 *  }
 */
export function format(node, context, recur) {
    if (!node.properties.length) {
        return context.write('{}');
    }

    let blockComments = context.blockComments(node);

    context.write('{\n');
    context.indentIn();
    for (let i = 0; i < node.properties.length; i++) {
        let previous = node.properties[i - 1];
        let child = node.properties[i];
        let next = node.properties[i + 1];

        context.write(blockComments.printLeading(child, previous, next));
        context.write(context.getIndent());
        recur(child);
        if (next) {
            context.write(',');
        }

        context.write(blockComments.printTrailing(child, previous, next));
        if (next) {
            context.write('\n');
        }
    }

    context.indentOut();
    context.write('\n', context.getIndent(), '}');
}
