/**
 *  {
 *      type: 'BinaryExpression',
 *      operator: '+',
 *      left: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _binary = require('../binary');

var binary = _interopRequireWildcard(_binary);

function format(node, context, recur) {
  binary.format(node, context, recur);
}