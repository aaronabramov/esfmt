import invariant from './invariant';

/**
 * The purpose of this class is to capture all comments for a given block and provide
 * an API for printing the comments for this block or its children.
 * It also makes sure that no comments get lost in parsing.
 * Even if something gets lost and is not printed for its corresponding child, all leftovers will
 * be printed at the end of the block.
 *
 * This class uses a lot of iteration and can be optimized for performance in future
 */
export default class BlockComments {
    constructor(context, blockNode) {
        this.context = context;
        this.blockNode = blockNode;

        // Define left and right ranges for the current block
        if (blockNode.type === 'Program') {
            this.leftRange = 0;
            this.rightRange = context.maxRange();
        } else {
            this.leftRange = blockNode.range[0];
            this.rightRange = blockNode.range[1];
        }
    }

    /**
     * First line comments are trailing comments for the opening curly
     * @example
     *      class A { // i'm the first line comment
     *          constructor() {}
     *      }
     *
     *      const a = { // me too!
     *          a: 5
     *      }
     */
    printFirstLine() {
        let comments = [];

        // update context.comment to exclude the matching first line comments
        this.context.comments = this.context.comments.filter((comment) => {
            if (comment.loc.start.line === this.blockNode.loc.start.line) {
                comments.push(comment);
                return false;
            }

            return true;
        });

        return comments.map(this.printComment.bind(this)).join(' ');
    }

    /**
     * Print Leading comments for the given node.
     *
     * Leading comments are the comments above the node of the block
     * @example
     *
     *      // I'm a leading comment
     *      / * me too * /
     *      someBlockNode() { ... };
     *
     * Criteria:
     * Any comment that has
     *  1. comment.range[0] > previousNode.range[0]
     *      // take the left range of the prev node
     *      // we assume that its own comments were already extracted
     *      // @see https://github.com/eslint/espree/issues/41
     *
     *      AND
     *
     *  2. comment.range[0] < node.range[0]
     *
     * if it is the first node in the block then
     *  3. block.range[0] < comment.range[0]
     */
    printLeading(node, prev) {
        let comments = [];
        let match = [];

        let leftRange = (prev && prev.range[0]) || this.leftRange;
        let rightRange = node.range[0];

        this.context.comments.forEach((comment) => {
            if (comment.range[0] >= leftRange && comment.range[0] < rightRange) {
                match.push(comment);
            } else {
                comments.push(comment);
            }
        });

        // Remove found comments from the context.comments
        // TODO: move mutating logic to the context and expose a fn doing that
        this.context.comments = comments;

        return match.map((comment) => {
            return this.context.getIndent()
                + this.printComment(comment) + '\n';
        }).join('');
    }

    /**
     * Trailing comments are the comments that are on the same line after
     * The node, or the comments within the block after the last node
     * @example
     *  if (true) {
     *      a + b; // i'm the trailing comment
     *      // i am NOT
     *      c + d; /* trailing! * / // i'm the trailing comment too
     *      // so am i
     *  }
     *
     *  Criteria:
     *      1. Same line trailing comments
     *          1.1. comment.range[0] > node.range[0] // includes comments within
     *              AND
     *          1.2 comment.range[0] < next.range[0]
     *              AND
     *          1.3 comment.loc.start.line === node.loc.end.line
     *      2. Comments after the node
     *          2.1 comment.range[0] > node.range[0]
     *          2.2 comment.range[1] < next.range[0]
     *
     */
    printTrailing(node, prev, next) {
        let sameLine = [];
        let after = [];
        let comments = [];
        let result = '';

        let leftRange = node.range[0];
        let rightRange = (next && next.range[0]) || this.rightRange;


        this.context.comments.forEach((comment) => {
            if (comment.range[0] > leftRange && comment.range[0] < rightRange) {
                if (comment.loc.start.line === node.loc.end.line) {
                    return sameLine.push(comment);
                }

                if (next) {
                    // that's a leading comment of the next node
                    // not trailing comment of this node
                    return comments.push(comment);
                }

                after.push(comment);
            } else {
                comments.push(comment);
            }
        });

        invariant(
            sameLine.filter(c => c.type === 'Line').length <= 1,
            'there can be only one line comment on the line'
        );

        if (sameLine.length) {
            result = ' ' + sameLine.map(this.printComment.bind(this)).join(' ');
        }

        after.forEach((comment) => {
            result += '\n' + this.context.getIndent()
                + this.printComment(comment);
        });

        // remove found comments from context
        this.context.comments = comments;

        return result;
    }

    printComment(comment) {
        switch (comment.type) {
        case 'Line':
            return this.printLineComment(comment);
        case 'Block':
            return this.printBlockComment(comment);
        }
    }

    printLineComment(comment) {
        return '//' + comment.value;
    }

    printBlockComment(comment) {
        return '/*' + comment.value + '*/';
    }
}
