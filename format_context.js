import BlockComments from './utils/block_comments';

export default class FormatContext {
    /**
     * Create a context object for formatting
     *
     * @param {Object} config formatting configuration object
     *  @see ./default_config.js
     * @param {Object} ast parsed ast
     */
    constructor(config, ast) {
        this.config = config;
        this.currentIndentation = 0;
        this.ast = ast;
        this.comments = ast.comments;
        this.result = '';
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
     * Create a BlockComments object that will hold the state of
     * the current block
     *
     * @param {Object} blockNode Programm, BlockStatement, etc.
     */
    blockComments(blockNode) {
        return new BlockComments(this, blockNode);
    }

    /**
     * return left range of the file
     * @return {Number}
     */
    maxRange() {
        let lastCommentRange;

        if (this.comments.length) {
            lastCommentRange = this.comments[this.comments.length - 1]
                .range[1];
        }

        return Math.max(
            this.ast.range[1],
            lastCommentRange || 0
        )
    }

    write(str) {
        if (arguments.length > 1) {
            str = '';

            for (let i = 0; i < arguments.length; i++) {
                str += arguments[i];
            }
        }

        this.result += str;
    };

    lock() {}
}
