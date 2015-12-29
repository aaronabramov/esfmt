/**
 *  {
 *      type: 'ThrowStatement',
 *      argument: {
 *          type: 'NewExpression',
 *          callee: {
 *              type: 'Identifier',
 *              name: 'Error',
 *              range: [Object]
 *          },
 *          arguments: [
 *              [Object]
 *          ],
 *          range: [3551, 3577]
 *      },
 *      range: [3545, 3578]
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context, recur) {
  context.write('throw ');
  recur(node.argument);}