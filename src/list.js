/**
 * List is a list of comma separated elements
 * @example
 *
 * 1. function call
 *      a.b(1, 2, 3, 4)
 * 2. function declaration
 *      function abc(a, b, c) {}
 * 3. module import
 *      import {a, b, c} from 'module';
 * 4. module export
 *      export {a as m, b, c};
 * etc.
 */

const WRAPPERS = {
    '[]': {left: '[', right: ']'},
    '{}': {left: '{', right: '}'},
    '()': {left: '(', right: ')'}
};

/**
 * Render the long version of the list
 *
 * @example
 *  [1, 2, 3, 4, 5]
 */
export function long(node, items, context, recur, wrap) {
    if (!items.length) {
        return context.write(WRAPPERS[wrap].left, WRAPPERS[wrap].right);
    }

    context.write(WRAPPERS[wrap].left);

    for (let i = 0; i < items.length; i++) {
        recur(items[i]);

        if (items[i + 1]) {
            context.write(', ');
        }
    }

    context.write(WRAPPERS[wrap].right);
}

/**
 * Render the short or compact version of the list
 *
 * @example
 *  [
 *      1,
 *      2,
 *      3,
 *      4
 *  ]
 */
export function short(node, items, context, recur, wrap) {
    if (!items.length) {
        return context.write(WRAPPERS[wrap].left, WRAPPERS[wrap].right);
    }

    let blockComments = context.blockComments(node);

    context.write(WRAPPERS[wrap].left);

    let firstLineComment = blockComments.printFirstLine();
    if (firstLineComment) {
        context.write(' ', firstLineComment);
    }

    context.write('\n');
    context.indentIn();

    for (let i = 0; i < items.length; i++) {
        let previous = items[i - 1];
        let current = items[i];
        let next = items[i + 1];

        context.write(blockComments.printLeading(current, previous));
        context.write(context.getIndent());

        recur(current);

        if (next) {
            context.write(',');
        }

        context.write(blockComments.printTrailing(current, previous, next));

        if (next) {
            context.write('\n');
        }
    }

    context.indentOut();
    context.write('\n', context.getIndent(), WRAPPERS[wrap].right);
}
