'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.extraNewLineBetween = extraNewLineBetween;
var ALWAYS_NEED_EXTRA_NEWLINE_AFTER = {
    BlockStatement: true,
    VariableDeclaration: true,
    FunctionExpression: true,
    FunctionDeclaration: true,
    IfStatement: true,
    ForStatement: true,
    ObjectExpression: true
};

/**
 * Some elements of the body of the block (Programm, BlockStatement)
 * need to know whether they need to prepend a newline before them.
 *
 * Example can be
 *  1. Any element after imports declaration
 *      import A from 'a';
 *      import B from 'b';
 *
 *      A.b() + B.c();
 *
 *  2. anything after if else block
 *      if (a) {
 *          return b;
 *      }
 *
 *      a + b;
 *
 *
 * @param {Object} previous node
 * @param {Object} current node
 */

function extraNewLineBetween(previous, current) {
    // no new line before the first element of the block
    if (!previous) {
        return false;
    }

    /**
     * always have newline before return, unless it's the only statement
     */
    if (previous && current.type === 'ReturnStatement') {
        return true;
    }

    // group var declarations together
    // Example
    //  var a = 5;
    //  var b = 5;
    //  var l;
    if (previous.type === 'VariableDeclaration' && current.type === 'VariableDeclaration') {
        return false;
    }

    if (ALWAYS_NEED_EXTRA_NEWLINE_AFTER[previous.type]) {
        return true;
    }

    if (previous.type === 'ImportDeclaration' && current.type !== 'ImportDeclaration') {
        return true;
    }

    if (newLineAfterCompositeExpressions(previous)) {
        return true;
    }

    return false;
}

/**
 * Returns true if newline is needed after the composite expression
 *
 * Examples:
 *  1. Assignment expression
 *      a.b.c = function() {
 *          return 4;
 *      }
 *
 *  2. a + function() {
 *         return 2;
 *     }
 *
 */
function newLineAfterCompositeExpressions(previous) {
    if (['BinaryExpression', 'AssignmentExpression'].includes(previous.type)) {
        if (ALWAYS_NEED_EXTRA_NEWLINE_AFTER[previous.right.type]) {
            return true;
        }
    }

    if (previous.type === 'ExpressionStatement') {
        var expression = previous.expression;

        switch (expression.type) {
            case 'AssignmentExpression':
                return ALWAYS_NEED_EXTRA_NEWLINE_AFTER[expression.right.type];
                break;
        }
    }
}