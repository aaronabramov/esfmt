/**
 *  {
 *      type: 'IfStatement',
 *      test: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      consequent: {
 *          type: 'ReturnStatement',
 *          argument: {
 *              type: 'Literal',
 *              value: 5,
 *              raw: '5'
 *          }
 *      },
 *      alternate: null
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _line_terminator = require('../line_terminator');

var utils = _interopRequireWildcard(_line_terminator);

function format(node, context, recur) {
    context.write('if (');
    recur(node.test);
    context.write(') ');

    if (node.consequent.type !== 'BlockStatement') {
        context.write('{\n');
        context.indentIn();
        context.write(context.getIndent());
        recur(node.consequent);
        context.write(utils.getLineTerminator(node.consequent), '\n');

        context.indentOut();
        context.write(context.getIndent(), '}');
    } else {
        recur(node.consequent);
    }

    if (node.alternate) {
        context.write(' else ');
        recur(node.alternate);
    }
}