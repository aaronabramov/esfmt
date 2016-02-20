/**
 * { type: 'Literal', value: 5, raw: '5' }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context) {
    // sometimes literals are parsed with trailing and leading whitespace
    var raw = node.raw.replace(/^\s*/, '').replace(/\s*$/, '');
    context.write(raw);}