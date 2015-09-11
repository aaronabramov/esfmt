/**
 * { type: 'Identifier', name: 'a' }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write(node.name);
}