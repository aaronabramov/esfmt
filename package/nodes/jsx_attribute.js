/**
 *    {
 *        type: 'JSXAttribute',
 *        name: {
 *            type: 'JSXIdentifier',
 *            name: 'className'
 *        },
 *        value: {
 *            type: 'Literal',
 *            value: 'abc',
 *            raw: '"abc"'
 *        }
 *    }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.name);
  context.write('=');
  recur(node.value);
}