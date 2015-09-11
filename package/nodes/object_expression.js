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
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _parentheses = require('../parentheses');

var utils = _interopRequireWildcard(_parentheses);

function format(node, context, recur) {
    if (!node.properties.length) {
        return context.write('{}');
    }

    var blockComments = context.blockComments(node);

    context.write('{\n');
    context.indentIn();
    for (var i = 0; i < node.properties.length; i++) {
        var previous = node.properties[i - 1];
        var child = node.properties[i];
        var next = node.properties[i + 1];

        context.write(blockComments.printLeading(child, previous, next));
        context.write(context.getIndent());
        recur(child);
        if (next) {
            context.write(',');
        }

        context.write(blockComments.printTrailing(child, previous, next));
        if (next) {
            context.write('\n');
        }
    }

    context.indentOut();
    context.write('\n', context.getIndent(), '}');
}

;