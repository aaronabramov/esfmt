/**
 *  {
 *      type: 'CatchClause',
 *      param: {
 *          type: 'Identifier',
 *          name: 'e'
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: []
 *      }
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
  context.write('catch (');
  recur(node.param);
  context.write(') ');
  recur(node.body);}