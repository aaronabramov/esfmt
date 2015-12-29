/**
 *  {
 *      type: 'JSXExpressionContainer',
 *      expression: {
 *          type: 'Identifier',
 *          name: 'test'
 *      }
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context, recur) {
  context.write('{');
  recur(node.expression);
  context.write('}');}