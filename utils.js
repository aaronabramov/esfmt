/**
 * Stateles utility funcitons
 */

const ALWAYS_NEED_EXTRA_NEWLINE_AFTER = {
    BlockStatement: true,
    VariableDeclaration: true,
    FunctionExpression: true,
    FunctionDeclaration: true
};

const DONT_NEED_SEMICOLON_AFTER = {
    ForInStatement: true,
    ForStatement: true,
    FunctionDeclaration: true,
    IfStatement: true,
    TryStatement: true,
};

/**
 * Map of operators to their precendenge numeric value (starting from 1),
 * the lower the index, the higher the precedence
 *
 * @example
 *  {'*': 5, '+': 4, '=': 3, ...}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */
let PRECEDENCE = {};

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
    [ '=', '+=', '-=', '**=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']
].forEach((ops, index) => {
    ops.forEach((op) => PRECEDENCE[op] = index + 1) // + 1 to avoid evaluating 0 to false
});

/**
 * Nodes that may need grouping perentheses depending on the context
 * they are used in. e.g. `a + 1` may need parantheses if it's used
 * as a right or left part of another operation `4 / (a + 1)`
 */
const MAY_NEED_PARENTHESES = {
    BinaryExpression: true,
    AssignmentExpression: true,
    LogicalExpression: true
}

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
export function extraNewLineBetween(previous, current) {
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
    if (previous.type === 'VariableDeclaration' &&
        current.type === 'VariableDeclaration') {
        return false;
    }


    if (ALWAYS_NEED_EXTRA_NEWLINE_AFTER[previous.type]) {
        return true;
    }

    if (previous.type === 'ImportDeclaration'
        && current.type !== 'ImportDeclaration') {
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
        let expression = previous.expression;

        switch (expression.type) {
            case 'AssignmentExpression':
                return ALWAYS_NEED_EXTRA_NEWLINE_AFTER[expression.right.type];
                break;
        }
    }
}

/**
 * @param {Object} node esprima node
 */
export function getLineTerminator(node) {
    return DONT_NEED_SEMICOLON_AFTER[node.type] ? '' : ';';
}

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
export function needParentheses(node, child) {
    if (!MAY_NEED_PARENTHESES[child.type]) {
        return false;
    }

    const [parentOp, childOp] = [node.operator, child.operator];

    return hasPrecedence(parentOp, childOp);
}

/**
 * Return true if the first operator has precedence over the second
 *  hasPrecedence('/', '+') => true
 *
 * @param {String} op1
 * @param {String} op2
 */
function hasPrecedence(op1, op2) {
    if (!PRECEDENCE[op1] || !PRECEDENCE[op2]) {
        throw new Error([
            'Missing precedence number for ',
            JSON.stringify(op1), ' or ', JSON.stringify(op2),
            '. See `let PRECEDENCE`'
        ].join(''));
    }

    return PRECEDENCE[op1] < PRECEDENCE[op2];
}

/**
 * '12 + 3' => '(12 + 3)'
 */
export function wrapInParantheses(str) {
    return '(' + str + ')';
}
