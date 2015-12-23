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
export function long(nodes, context, recur, wrap) {
    context.write(WRAPPERS[wrap].left);

    for (let i = 0; i < nodes.length; i++) {
        recur(nodes[i]);

        if (nodes[i + 1]) {
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
export function short(nodes, context, recur, wrap) {
    context.write(WRAPPERS[wrap].left);
    context.indentIn();
    context.write('\n');

    for (let i = 0; i < nodes.length; i++) {
        context.write(context.getIndent());
        recur(nodes[i]);

        if (nodes[i + 1]) {
            context.write(',\n');
        }
    }

    context.indentOut();
    context.write('\n', context.getIndent(), WRAPPERS[wrap].right);
}
