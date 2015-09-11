/**
 *   {
 *      type: 'ImportDefaultSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'A'
 *      }
 *  }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.local);
}