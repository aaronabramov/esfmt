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
     * Get all the comments for given range.
     * It'll remove them from the context state, so none of the comments
     * will be returned twice.
     *
     * @param {Number} prevLeft range (previous element left)
     * @param {Number} right range
     */
    extractComments(prevLeft, right, nextLeft, line) {
        let leading = [];
        let trailing = [];
        let comments = [];

        this.comments.forEach(function(comment) {
            // Everything between the end of the last element
            // and the end of the current is a leading comment
            let isLeading = comment.range[0] >= prevLeft
                && comment.range[0] <= right;

            if (isLeading) {
                return leading.push(comment);
            }

            // If it's not inside the range, but
            // 1. It starts BEFORE the next element's left range
            // 2. Its `loc.start.line === line`
            // then it's a trailing comment
            if (nextLeft && line) {
                if (comment.range[0] < nextLeft
                    && line === comment.loc.start.line) {
                    return trailing.push(comment);
                }
            }

            // If it's none of the above then keep it in `this.comments`
            comments.push(comment);
        });

        // Mutate `this.comments`
        this.comments = comments;

        return {leading, trailing};
    }

    /**
     * extract all the comments that go after `left` range
     *
     * @return {Array}
     */
    extractCommentsAfter(left) {
        let match = [];
        let comments = [];

        this.comments.forEach((comment) => {
            if (comment.range[0] >= left) {
                return match.push(comment);
            } else {
                comments.push(comment);
            }
        });

        this.comments = comments;

        return match;
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
}
