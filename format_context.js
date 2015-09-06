const DONT_NEED_SEMICOLON_AFTER = {
    IfStatement: true
};

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
}
