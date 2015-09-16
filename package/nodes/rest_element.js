/**
 *  {
 *      type: 'RestElement',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'args'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('...');
  recur(node.argument);
}

;