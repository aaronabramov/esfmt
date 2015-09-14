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
 */

import {long, short} from '../list';

export function format(node, context, recur) {
    if (node.static) {
        context.write('static ');
    }

    if (node.kind === 'get') {
        context.write('get ');
    }

    if (node.kind === 'set') {
        context.write('set ');
    }

    recur(node.key);
    recur(node.value, {noFunctionKeyword: true});
};
