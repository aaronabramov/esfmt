import * as Program from './nodes/program';
import * as VariableDeclaration from './nodes/variable_declaration';
import * as VariableDeclarator from './nodes/variable_declarator';
import * as Literal from './nodes/literal';
import * as Identifier from './nodes/identifier';
import * as ExpressionStatement from './nodes/expression_statement';
import * as CallExpression from './nodes/call_expression';
import * as MemberExpression from './nodes/member_expression';
import * as FunctionDeclaration from './nodes/function_declaration';
import * as BlockStatement from './nodes/block_statement';
import * as ReturnStatement from './nodes/return_statement';
import * as BinaryExpression from './nodes/binary_expression';
import * as FunctionExpression from './nodes/function_expression';
import * as NewExpression from './nodes/new_expression';
import * as ObjectExpression from './nodes/object_expression';
import * as Property from './nodes/property';
import * as ArrayExpression from './nodes/array_expression';
import * as AssignmentExpression from './nodes/assignment_expression';
import * as IfStatement from './nodes/if_statement';
import * as UnaryExpression from './nodes/unary_expression';
import * as JSXElement from './nodes/jsx_element';
import * as JSXOpeningElement from './nodes/jsx_opening_element';
import * as JSXClosingElement from './nodes/jsx_closing_element';
import * as JSXIdentifier from './nodes/jsx_identifier';
import * as JSXAttribute from './nodes/jsx_attribute';
import * as JSXExpressionContainer from './nodes/jsx_expression_container';
import * as ArrowFunctionExpression from './nodes/arrow_function_expression';


import esprima from 'espree';
import esprimaOptions from './esprima_options';

import defaultConfig from './default_config';
import FormatContext from './format_context';

const NODE_TYPES = {
    Program,
    VariableDeclaration,
    VariableDeclarator,
    Literal,
    Identifier,
    ExpressionStatement,
    CallExpression,
    MemberExpression,
    FunctionDeclaration,
    BlockStatement,
    ReturnStatement,
    BinaryExpression,
    FunctionExpression,
    NewExpression,
    ObjectExpression,
    Property,
    ArrayExpression,
    AssignmentExpression,
    IfStatement,
    UnaryExpression,
    JSXElement,
    JSXOpeningElement,
    JSXClosingElement,
    JSXIdentifier,
    JSXAttribute,
    JSXExpressionContainer,
    ArrowFunctionExpression
};



/**
 * @param {String} code to be formatted
 * @param {Object} config
 */
export function format(code, config) {
    let ast;

    try {
        ast = esprima.parse(code, esprimaOptions);
    } catch(e) {
        console.error('Failed parsing javascript');
        throw e;
    }

    config = Object.assign({}, config, defaultConfig);

    // console.log('AST: \n', JSON.stringify(ast, null, 2));


    return formatAst(ast, new FormatContext(config));

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

    // recur function that will hold context and itself in a closule
    const recur = (node) => {
        return formatAst(node, context, recur);
    };

    if (!nodeNamespace) {
        throw new Error('unknown node type: ' + node.type);
    }

    return nodeNamespace.format(node, context, recur);
}


function createFormatContext(config) {
};
