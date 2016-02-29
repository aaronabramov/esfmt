import * as utils from './line_terminator';
import * as newlines from './newlines';

/**
 * Shared block formatting function
 *
 * @param {Object} node Program or BlockStatement
 * @param {Object} context
 * @param {Function} recur
 */
export function format(node, context, recur) {
    let blockComments = context.blockComments(node);

    for (let i =0; i < node.body.length; i++) {
        let previous = node.body[i - 1];
        let current = node.body[i];
        let next = node.body[i + 1];

        if (current.type === 'EmptyStatement') {
            continue;
        }

        if (newlines.extraNewLineBetween(previous, current)) {
            context.write('\n');
        }

        context.write(blockComments.printLeading(current, previous));
        context.write(context.getIndent());
        recur(current);
        context.write(utils.getLineTerminator(current));
        context.write(blockComments.printTrailing(current, previous, next));

        if (next) {
            context.write('\n');
        }
    }
}
