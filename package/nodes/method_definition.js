/**
 *  {
 *      type: 'MethodDefinition',
 *      key: {
 *          type: 'Identifier',
 *          name: 'constructor'
 *      },
 *      value: {
 *          type: 'FunctionExpression',
 *          id: null,
 *          params: [],
 *          body: {
 *              type: 'BlockStatement',
 *              body: []
 *          },
 *          generator: false,
 *          expression: false
 *      },
 *      kind: 'constructor',
 *      computed: false,
 *      static: false
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
    if (node['static']) {
        context.write('static ');}


    if (node.kind === 'get') {
        context.write('get ');}


    if (node.kind === 'set') {
        context.write('set ');}


    recur(node.key);
    recur(node.value, { noFunctionKeyword: true });}