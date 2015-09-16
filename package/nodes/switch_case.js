/**
 *  {
 *      type: 'SwitchCase',
 *      test: null,
 *      consequent: [{
 *          type: 'ReturnStatement',
 *          argument: [Object]
 *      }]
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _line_terminator = require('../line_terminator');

function format(node, context, recur) {
    if (node.test) {
        context.write('case ');
        recur(node.test);
        context.write(':');
    } else {
        context.write('default:');
    }

    context.indentIn();

    for (var i = 0; i < node.consequent.length; i++) {
        context.write('\n', context.getIndent());
        recur(node.consequent[i]);

        context.write((0, _line_terminator.getLineTerminator)(node.consequent[i]));
    }

    context.indentOut();
}