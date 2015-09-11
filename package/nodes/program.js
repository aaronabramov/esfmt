/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _block = require('../block');

function format(node, context, recur) {
    (0, _block.format)(node, context, recur);
    if (context.config.newLineAtTheEnd) {
        context.write('\n');
    }
}

;