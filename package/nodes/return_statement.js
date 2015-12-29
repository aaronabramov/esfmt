/**
 *    argument: {
 *        type: 'BinaryExpression',
 *        operator: '+',
 *        left: {
 *            type: 'Identifier',
 *            name: 'a'
 *        },
 *        right: {
 *            type: 'Identifier',
 *            name: 'b'
 *        }
 *    }
 *    }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context, recur) {
    context.write('return');
    if (node.argument) {
        context.write(' ');
        recur(node.argument);}}