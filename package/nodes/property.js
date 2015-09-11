/**
 *  {
 *      type: 'Property',
 *      key: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      value: {
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      },
 *      kind: 'init',
 *      method: false,
 *      shorthand: false,
 *      computed: false
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.key);
  context.write(': ');
  recur(node.value);
}

;