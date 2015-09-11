/**
 *  {
 *      type: 'JSXClosingElement',
 *      name: {
 *          type: 'JSXIdentifier',
 *          name: 'div'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('</');
  recur(node.name);
  context.write('>');
}