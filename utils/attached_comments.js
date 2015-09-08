/**
 * EXPERIMENTAL
 *
 * Needs every comment to be propagated to the top.
 */

/**
 * Attach comments to a result string that represents the node
 *
 * @param {String} str rusulting string of the node
 *  may include [,:})] or stuff like that
 * @param {Object} node original esprima node
 */
export function attach(str, node) {
    console.log(node);
    // console.log(node.trailingComments);
    // console.log(node.leadingComments);

    if (node.leadingComments) {
        str = attachLeadingComments(str, node.leadingComments);
    }

    if (node.trailingComments) {
        str = attachTrailingComments(str, node.trailingComments);
    }

    return str;
}

function attachTrailingComments(str, comments) {
    comments.forEach((comment) => {
        switch (comment.type) {
            case 'Line':
                str += ' //' + comment.value;
                break;
        }
    });

    return str;
}

function attachLeadingComments(str, comments) {
    comments.forEach((comment) => {
        switch (comment.type) {
            case 'Block':
                str = '/*' + comment.value + '*/ ' + str
                break;
        }
    });

    return str;
}
