/**
 *  {
 *      type: 'Property',
 *      key: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      value: {
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      },
 *      kind: 'init',
 *      method: false,
 *      shorthand: false,
 *      computed: false
 *  }
 */
export function format(node, context, recur) {
    if (node.computed) {
        context.write('[');
    }

    recur(node.key);

    if (node.computed) {
        context.write(']');
    }

    if (!node.shorthand) {
        context.write(': ');
        recur(node.value);
    }
}
