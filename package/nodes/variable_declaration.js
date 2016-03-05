/**
 *  {
 *      type: 'VariableDeclaration',
 *      declarations: [{
 *          type: 'VariableDeclarator',
 *          id: [Object],
 *          init: [Object]
 *      }],
 *      kind: 'var'
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;
var DONT_INDENT = { 
    FunctionDeclaration: true };


function format(node, context, recur) {
    context.write(node.kind, ' ');

    var blockComments = context.blockComments(node);
    var indent = true;

    /**
     * If var declaration consists of one element and it's a function
     * it should not be indented
     * Example:
     *  let a = function() {
     *      return 1;
     *  };
     */
    if (node.declarations.length === 1) {
        indent = !!DONT_INDENT[node.declarations[0].type];}


    indent && context.indentIn();

    for (var i = 0; i < node.declarations.length; i++) {
        var previous = node.declarations[i - 1];
        var current = node.declarations[i];
        var next = node.declarations[i + 1];

        context.write(blockComments.printLeading(current, previous));

        if (i > 0) {
            context.write(context.getIndent());}


        recur(current);

        if (next) {
            context.write(',');}


        context.write(blockComments.printTrailing(current, previous, next));
        if (next) {
            context.write('\n');}}



    indent && context.indentOut();}