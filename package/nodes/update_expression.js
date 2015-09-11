/**
 *  {
 *      type: 'UpdateExpression',
 *      operator: '++',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      prefix: false
 *  }
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    if (node.prefix) {
        context.write(node.operator);
        recur(node.argument);
    } else {
        recur(node.argument);
        context.write(node.operator);
    }
}

;