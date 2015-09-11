import * as utils from './';
import * as newlines from './newlines';

/**
 * Shared block formatting function
 *
 * @param {Object} node Program or BlockStatement
 * @param {Object} context
 * @param {Function} recur
 */
export function format(node, context, recur) {
    let result = '';
    let blockComments = context.blockComments(node);

    for (let i =0; i < node.body.length; i++) {
        let previous = node.body[i - 1];
        let child = node.body[i];
        let next = node.body[i + 1];

        if (child.type === 'EmptyStatement') {
            continue;
        }

        if (newlines.extraNewLineBetween(previous, child)) {
            context.write('\n');
        }

        context.write(blockComments.printLeading(child, previous, next));
        context.write(context.getIndent());
        recur(child)
        context.write(utils.getLineTerminator(child));
        context.write(blockComments.printTrailing(child, previous, next));

        if (next) {
            context.write('\n');
        }
    }
}
