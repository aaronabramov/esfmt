/**
 *    {
 *        type: 'MetaProperty',
 *        meta: 'new',
 *        property: 'target',
 *        range: [31, 41],
 *        loc: {
 *            start: { line: 2, column: 16 },
 *            end: { line: 2, column: 26 }
 *        }
 *    }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context) {
  context.write(node.meta);
  context.write('.');
  context.write(node.property);}