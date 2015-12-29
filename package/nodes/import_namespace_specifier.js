/**
 *  {
 *      type: 'ImportNamespaceSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'A'
 *      }
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
  context.write('* as ');
  recur(node.local);}