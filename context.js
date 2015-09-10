import BlockComments from './utils/block_comments';

export default class Context {
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

    /**
     * Lock the result at the current position, later the rollback can be called
     * and everything that was written after the transaction was oppened
     * will be rolled back
     *
     * @example
     *
     *
     * let rollback = context.transaction();
     *
     *  recur(veryLongNode);
     *
     *  if (context.overflown()) {
     *      recur(veriLongNode, {short: true});
     *  }
     *
     */
    transaction() {
        let _this = this;
        let current = this.result;

        return function rollback() {
            _this.result = current;
        }
    }

    /**
     * Return whether any of the lines of the current written result
     * is longer than `config['max-len']` value
     */
    overflown() {
        let _this = this;

        return this.result.split('\n').some((line) => {
            return line.length > _this.config['max-len'];
        });
    }
}
