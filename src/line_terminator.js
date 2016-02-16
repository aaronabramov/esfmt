const DONT_NEED_SEMICOLON_AFTER = {
    ClassDeclaration: true,
    ForInStatement: true,
    ForOfStatement: true,
    ForStatement: true,
    FunctionDeclaration: true,
    IfStatement: true,
    SwitchStatement: true,
    TryStatement: true
};

/**
 * @param {Object} node esprima node
 */
export function getLineTerminator(node) {
    return DONT_NEED_SEMICOLON_AFTER[node.type] ? '' : ';';
}
