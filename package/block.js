'use strict';var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;var _line_terminator = require('./line_terminator');var utils = _interopRequireWildcard(_line_terminator);var _newlines = require(
'./newlines');var newlines = _interopRequireWildcard(_newlines);

/**
 * Shared block formatting function
 *
 * @param {Object} node Program or BlockStatement
 * @param {Object} context
 * @param {Function} recur
 */
function format(node, context, recur) {
    var blockComments = context.blockComments(node);

    for (var i = 0; i < node.body.length; i++) {
        var previous = node.body[i - 1];
        var child = node.body[i];
        var next = node.body[i + 1];

        if (child.type === 'EmptyStatement') {
            continue;}


        if (newlines.extraNewLineBetween(previous, child)) {
            context.write('\n');}


        context.write(blockComments.printLeading(child, previous, next));
        context.write(context.getIndent());
        recur(child);
        context.write(utils.getLineTerminator(child));
        context.write(blockComments.printTrailing(child, previous, next));

        if (next) {
            context.write('\n');}}}