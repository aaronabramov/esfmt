'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.getLineTerminator = getLineTerminator;var DONT_NEED_SEMICOLON_AFTER = { 
    ClassDeclaration: true, 
    ForInStatement: true, 
    ForOfStatement: true, 
    ForStatement: true, 
    FunctionDeclaration: true, 
    IfStatement: true, 
    SwitchStatement: true, 
    TryStatement: true, 
    WhileStatement: true };


/**
 * @param {Object} node esprima node
 */
function getLineTerminator(node) {
    return DONT_NEED_SEMICOLON_AFTER[node.type] ? '' : ';';}