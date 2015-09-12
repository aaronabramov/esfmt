const DONT_NEED_SEMICOLON_AFTER = {
    ForInStatement: true,
    ForStatement: true,
    FunctionDeclaration: true,
    IfStatement: true,
    TryStatement: true,
};

/**
 * @param {Object} node esprima node
 */
export function getLineTerminator(node) {
    return DONT_NEED_SEMICOLON_AFTER[node.type] ? '' : ';';
}