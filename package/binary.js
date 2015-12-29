/**
 * Shared code between binary and logical expressions
 *
 * @example
 *
 *  1. a + b + c
 *  2. a && b || c
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj['default'] = obj;return newObj;}}var _parentheses = require(

'./parentheses');var utils = _interopRequireWildcard(_parentheses);

function format(node, context, recur) {
    var leftParents = utils.needParentheses(node, node.left);
    var rightParents = utils.needParentheses(node, node.right);


    leftParents && context.write('(');
    recur(node.left);
    leftParents && context.write(')');

    context.write(' ', node.operator);

    var rollback = context.transaction();

    context.write(' ');
    rightParents && context.write('(');
    recur(node.right);
    rightParents && context.write(')');

    if (context.overflown()) {
        rollback();

        /**
         * Double indentation. Example:
         *  12345 || 3456789 &&
         *          67890;
         */
        context.indentIn();
        context.indentIn();
        context.write('\n', context.getIndent());
        context.indentOut();
        context.indentOut();

        rightParents && context.write('(');
        recur(node.right);
        rightParents && context.write(')');}}