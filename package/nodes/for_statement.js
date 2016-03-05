/**
 *  {
 *      type: 'ForStatement',
 *      init: {
 *          type: 'VariableDeclaration',
 *          declarations: [
 *              [Object]
 *          ],
 *          kind: 'var'
 *      },
 *      test: {
 *          type: 'BinaryExpression',
 *          operator: '<=',
 *          left: {
 *              type: 'Identifier',
 *              name: 'i'
 *          },
 *          right: {
 *              type: 'Literal',
 *              value: 555,
 *              raw: '555'
 *          }
 *      },
 *      update: {
 *          type: 'UpdateExpression',
 *          operator: '++',
 *          argument: {
 *              type: 'Identifier',
 *              name: 'i'
 *          },
 *          prefix: true
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      }
 *  }
 */'use strict';Object.defineProperty(exports, '__esModule', { value: true });exports.format = format;

function format(node, context, recur) {
    context.write('for (');

    if (node.init) {
        recur(node.init);}


    context.write(';');

    if (node.test) {
        context.write(' ');
        recur(node.test);}


    context.write(';');

    if (node.update) {
        context.write(' ');
        recur(node.update);}


    context.write(') ');
    recur(node.body);}