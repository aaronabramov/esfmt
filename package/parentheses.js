'use strict';var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];Object.defineProperty(exports, '__esModule', { value: true });exports.needParentheses = needParentheses;var _invariant = require('./invariant');var _invariant2 = _interopRequireDefault(_invariant);

/**
 * Map of operators to their precendenge numeric value (starting from 1),
 * the lower the index, the higher the precedence
 *
 * @example
 *  {'*': 5, '+': 4, '=': 3, ...}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */
var PRECEDENCE = {};

[
['*', '/'], 
['+', '-'], 
['<<', '>>', '>>>'], 
['<', '>', '<=', '>='], 
['==', '===', '!=', '!=='], 
['&'], 
['^'], 
['|'], 
['&&'], 
['||'], 
['=', '+=', '-=', '**=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']].
forEach(function (ops, index) {
    ops.forEach(function (op) {return PRECEDENCE[op] = index + 1;}); // + 1 to avoid evaluating 0 to false
});

/**
 * Nodes that may need grouping perentheses depending on the context
 * they are used in. e.g. `a + 1` may need parantheses if it's used
 * as a right or left part of another operation `4 / (a + 1)`
 */
var MAY_NEED_PARENTHESES = { 
    BinaryExpression: true, 
    AssignmentExpression: true, 
    LogicalExpression: true };


/**
 * Some expressions may have expression inside them, and the precedence
 * can conflict. For example:
 *   (1 + 2) / 3
 *
 * The AST of this like will look like this:
 *  BinaryExpression:
 *      operator: /
 *      left:
 *          BinaryExpression:
 *              operator: +
 *              left: 1
 *              right: 2
 *      right: 3
 *
 * In this case, the left part needs grouping parentheses around it, otherwise
 * `/` operator will take presedence (eg. `1 + 2 / 3`)
 *
 * @param {Object} node root expression. One of:
 *  BinaryExpression
 *  LogicalExpression
 *  AssignmentExpression
 * @param {Object} child right or left node
 */
function needParentheses(node, child) {
    if (!MAY_NEED_PARENTHESES[child.type]) {
        return false;}var 


    parentOp = node.operator;var childOp = child.operator;

    return hasPrecedence(parentOp, childOp);}


/**
 * Return true if the first operator has precedence over the second
 *  hasPrecedence('/', '+') => true
 *
 * @param {String} op1
 * @param {String} op2
 */
function hasPrecedence(op1, op2) {
    (0, _invariant2['default'])(PRECEDENCE[op1] && PRECEDENCE[op2], 'Missing precedence number for\n            ' + 
    JSON.stringify(op1) + ' or ' + JSON.stringify(op2) + '.\n            See ' + 
    JSON.stringify(PRECEDENCE));

    return PRECEDENCE[op1] < PRECEDENCE[op2];}