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
        let childResult = '';

        if (newlines.extraNewLineBetween(previous, child)) {
            childResult += '\n';
        }

        childResult += blockComments.printLeading(child, previous, next);
        childResult += context.getIndent() + recur(child) + utils.getLineTerminator(child);
        childResult += blockComments.printTrailing(child, previous, next);

        result += childResult;

        if (next) {
            result += '\n';
        }
    }

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
