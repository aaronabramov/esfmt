/**
 *  {
 *      type: 'ForInStatement',
 *      left: {
 *          type: 'VariableDeclaration',
 *          declarations: [
 *              [Object]
 *          ],
 *          kind: 'var'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'result'
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      each: false
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
  context.write('for (');
  recur(node.left);
  context.write(' in ');
  recur(node.right);
  context.write(') ');
  recur(node.body);}