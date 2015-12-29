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
 */'use strict';var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;var _binary = require(

'../binary');var binary = _interopRequireWildcard(_binary);

function format(node, context, recur) {
  binary.format(node, context, recur);}