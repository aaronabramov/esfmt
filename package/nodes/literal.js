/**
 * { type: 'Literal', value: 5, raw: '5' }
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write(node.raw);
}

;