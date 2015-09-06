import * as Program from './nodes/program';
import * as VariableDeclaration from './nodes/variable_declaration';
import * as VariableDeclarator from './nodes/variable_declarator';
import * as Literal from './nodes/literal';
import * as Identifier from './nodes/identifier';
import * as ExpressionStatement from './nodes/expression_statement';

import esprima from 'espree';
import esprimaOptions from './esprima_options';

import defaultConfig from './default_config';

const NODE_TYPES = {
    Program: Program,
    VariableDeclaration: VariableDeclaration,
    VariableDeclarator: VariableDeclarator,
    Literal: Literal,
    Identifier: Identifier,
    ExpressionStatement: ExpressionStatement
};



/**
 * @param {String} code to be formatted
 * @param {Object} config
 */
export function format(code, config) {
    const ast = esprima.parse(code, esprimaOptions);

    config = Object.assign({}, config, defaultConfig);

    // console.log('AST: \n', JSON.stringify(ast, null, 2));


    return formatAst(ast, createFormatContext(config));

};


/**
 * Multifunction for formatting an AST node (recursively)
 * dispatches to multiple format functions depending on the node type
 *
 * @param {Object} node esprima node
 * @param {Object} context formatting context object (state)
 */
function formatAst(node, context) {
    // find the node's namespace based on its type
    const nodeNamespace = NODE_TYPES[node.type];

    if (!nodeNamespace) {
        throw new Error('unknown node type: ' + node.type);
    }

    return nodeNamespace.format(node, context, formatAst);
}

/**
 * Create a context object for formatting
 *
 * @param {Object} config formatting configuration object
 * @see ./default_config.js
 */
function createFormatContext(config) {
    return {
        config: config
    };
};
