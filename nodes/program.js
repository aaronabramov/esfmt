/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */

// TODO: get the comments code out of here

import * as utils from '../utils';
import * as newlines from '../utils/newlines';

export function format(node, context, recur) {
    let result = '';

    for (let i =0; i < node.body.length; i++) {
        let previous = node.body[i - 1];
        let child = node.body[i];
        let next = node.body[i + 1];

        let childResult = '';

        if (newlines.extraNewLineBetween(previous, child)) {
            childResult += '\n';
        }


        // ATTACH COMMENTS
        let nextLeft;
        let prevRight;

        if (!previous && node.type === 'Program') {
            // in tihs case include everything from the beginning of the file
            prevRight = 0;
        } else {
            // either prev element right, ore the left of the block node
            prevRight = (previous && previous.range[1]) || node.range[0];
        }

        if (!next && node.type === 'Program') {
            nextLeft = context.maxRange();
        } else {
            nextLeft = (next && next.range[0]) || node.range[1];
        }

        let line = child.loc.end.line;
        let comments = context.extractComments(prevRight, child.range[1], nextLeft, line);

        comments.leading.forEach((comment) => {
            childResult += context.getIndent() + '//' + comment.value + '\n';
        });

        childResult += recur(child) + utils.getLineTerminator(child);

        if (comments.trailing.length > 1) {
            throw Error('Something is wrong, there can be only zero or one trailing comment');
        }

        if (comments.trailing.length) {
            childResult += ' //' + comments.trailing[0].value;
        }


        result += childResult;

        if (next) {
            result += '\n';
        }
    }

    // now grab the rest of the comment and render them
    let leftRange;
    let lastChild = node.body[node.body.length - 1];

    if (lastChild) {
        leftRange = lastChild.range[1];
    } else {
        // if no nodes, then use the beginnig of the block/program
        lastRange = node.range[0];
    }

    let rightRange;

    if (node.type === 'Program') {
        rightRange = context.maxRange();
    } else {
        node.range[1];
    }

    let bottomComments = context.extractComments(leftRange, rightRange);


    if (bottomComments.trailing.length) {
        throw new Error('there cant be trailing comments');
    }

    bottomComments.leading.forEach((comment) => {
        result += '\n' + context.getIndent() + '//' + comment.value;
    });

    // context.extractCommentsAfter(previous.range[1]).forEach((comment) => {
    //     result += '\n' + context.getIndent() + '//' + comment.value;
    // });

    if (context.config.newLineAtTheEnd) {
        result += '\n';
    }

    return result;
}
