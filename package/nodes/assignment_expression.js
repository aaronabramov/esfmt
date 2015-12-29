/**
 *  { type: 'AssignmentExpression',
 *    operator: '=',
 *    left: { type: 'Identifier', name: 'abc' },
 *    right: { type: 'Identifier', name: 'cde' } }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context, recur) {
  recur(node.left);
  context.write(' ', node.operator, ' ');
  recur(node.right);}