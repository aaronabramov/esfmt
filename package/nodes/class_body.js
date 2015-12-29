/**
 *  {
 *      type: 'ClassBody',
 *      body: [{
 *          type: 'MethodDefinition',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'constructor',
 *          computed: false,
 *          static: false
 *      }, {
 *          type: 'MethodDefinition',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'get',
 *          computed: false,
 *          static: false
 *      }, {
 *          type: 'MethodDefinition',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'method',
 *          computed: false,
 *          static: false
 *      }]
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context, recur) {
    context.write('{');
    context.indentIn();

    for (var i = 0; i < node.body.length; i++) {
        if (node.body[i - 1]) {
            context.write('\n');}


        context.write('\n', context.getIndent());
        recur(node.body[i]);}


    context.indentOut();
    context.write('\n', context.getIndent(), '}');}