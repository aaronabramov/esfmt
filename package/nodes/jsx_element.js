/**
 *  {
 *      type: 'JSXElement',
 *      openingElement: {
 *          type: 'JSXOpeningElement',
 *          name: {
 *              type: 'JSXIdentifier',
 *              name: 'div'
 *          },
 *          selfClosing: false,
 *          attributes: []
 *      },
 *      closingElement: {
 *          type: 'JSXClosingElement',
 *          name: {
 *              type: 'JSXIdentifier',
 *              name: 'div'
 *          }
 *      },
 *      children: []
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
    recur(node.openingElement);

    if (node.closingElement) {
        var i = undefined;
        // Don't print literals that have only whitespace
        var elements = node.children.filter(notWhitespaceLiteral);


        context.indentIn();

        for (i = 0; i < elements.length; i++) {
            var child = elements[i];
            var prev = elements[i - 1];

            if (needLinebreak(child, prev)) {
                context.write('\n', context.getIndent());}


            recur(child);}


        // the last linebreak
        if (elements.length) {
            context.write('\n');}


        context.indentOut();
        context.write(context.getIndent());
        recur(node.closingElement);}}



function needLinebreak(node, prev) {
    // if it's the first child
    if (!prev) {
        return true;}


    // if the previous was a jsx tag. Example:
    //
    // <br />
    // 'abc'
    if (prev && prev.type === 'JSXElement') {
        return true;}}



/**
 * JSX contents are parsed as a bunch of whitespace literals
 * for example the following structure
 *  <div>
 *      <App />
 *  </div>
 *
 * Will have childre elements
 *  1. "\n    "
 *  2. <App />
 *  3. "\n"
 *
 * We want to reformat it, so we strip down all whitespaces, so that
 * we can add them later in the right order with correct indentation.
 */
function notWhitespaceLiteral(node) {
    if (node.type === 'Literal') {
        return !node.raw.match(/^\s+$/);}


    return true;}