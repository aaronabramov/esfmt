/**
 *  {
 *      type: 'BlockStatement',
 *      body: [{
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

var _block = require('../block');

function format(node, context, recur) {
    if (!node.body.length) {
        return context.write('{}');
    }

    context.write('{\n');
    context.indentIn();
    (0, _block.format)(node, context, recur);
    context.indentOut();
    context.write('\n', context.getIndent(), '}');
}

;