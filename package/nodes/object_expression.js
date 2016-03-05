/**
 *  {
 *      type: 'ObjectExpression',
 *      properties: [{
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }, {
 *          type: 'Property',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'init',
 *          method: false,
 *          shorthand: false,
 *          computed: false
 *      }]
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
function format(node, context, recur) {
    if (!node.properties.length) {
        return context.write('{}');}


    var blockComments = context.blockComments(node);

    context.write('{\n');
    context.indentIn();
    for (var i = 0; i < node.properties.length; i++) {
        var previous = node.properties[i - 1];
        var current = node.properties[i];
        var next = node.properties[i + 1];

        context.write(blockComments.printLeading(current, previous));
        context.write(context.getIndent());
        recur(current);
        if (next) {
            context.write(',');}


        context.write(blockComments.printTrailing(current, previous, next));
        if (next) {
            context.write('\n');}}



    context.indentOut();
    context.write('\n', context.getIndent(), '}');}