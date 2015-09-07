const DONT_NEED_SEMICOLON_AFTER = {
    ForStatement: true,
    FunctionDeclaration: true,
    IfStatement: true,
    TryStatement: true
};

const ALWAYS_NEED_EXTRA_NEWLINE_AFTER = {
    FunctionDeclaration: true,
    IfStatement: true,
    TryStatement: true
}

export default class FormatContext {
    /**
     * Create a context object for formatting
     *
     * @param {Object} config formatting configuration object
     * @see ./default_config.js
     */
    constructor(config) {
        this.config = config;
        this.currentIndentation = 0;
    }

    indentIn() {
        this.currentIndentation++;
    }

    indentOut() {
        this.currentIndentation--;
    }

    // get a whitespace string containing X number of spaces, where
    // X is this.currentIndentation * this.config.indentation
    getIndent() {
        const indent = new Array(this.config.indentation + 1).join(' ');
        return new Array(this.currentIndentation + 1).join(indent);
    }

    /**
     * @param {Object} node esprima node
     */
    getLineTerminator(node) {
        return DONT_NEED_SEMICOLON_AFTER[node.type] ? '' : ';';
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
    extraNewLineBetween(previous, current) {
        // no new line before the first element of the block
        if (!previous) {
            return false;
        }

        if (ALWAYS_NEED_EXTRA_NEWLINE_AFTER[previous.type]) {
            return true;
        }

        if (previous.type === 'ImportDeclaration' && current.type !== 'ImportDeclaration') {
            return true;
        }

        return false;
    }
}
