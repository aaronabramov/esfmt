import * as ArrayExpression from './nodes/array_expression';
import * as ArrowFunctionExpression from './nodes/arrow_function_expression';
import * as AssignmentExpression from './nodes/assignment_expression';
import * as BinaryExpression from './nodes/binary_expression';
import * as BlockStatement from './nodes/block_statement';
import * as CallExpression from './nodes/call_expression';
import * as CatchClause from './nodes/catch_clause';
import * as ConditionalExpression from './nodes/conditional_expression';
import * as ExpressionStatement from './nodes/expression_statement';
import * as FunctionDeclaration from './nodes/function_declaration';
import * as FunctionExpression from './nodes/function_expression';
import * as Identifier from './nodes/identifier';
import * as IfStatement from './nodes/if_statement';
import * as ImportDeclaration from './nodes/import_declaration';
import * as JSXAttribute from './nodes/jsx_attribute';
import * as JSXClosingElement from './nodes/jsx_closing_element';
import * as JSXElement from './nodes/jsx_element';
import * as JSXExpressionContainer from './nodes/jsx_expression_container';
import * as JSXIdentifier from './nodes/jsx_identifier';
import * as JSXOpeningElement from './nodes/jsx_opening_element';
import * as Literal from './nodes/literal';
import * as LogicalExpression from './nodes/logical_expression';
import * as MemberExpression from './nodes/member_expression';
import * as NewExpression from './nodes/new_expression';
import * as ObjectExpression from './nodes/object_expression';
import * as Program from './nodes/program';
import * as Property from './nodes/property';
import * as ReturnStatement from './nodes/return_statement';
import * as TryStatement from './nodes/try_statement';
import * as UnaryExpression from './nodes/unary_expression';
import * as UpdateExpression from './nodes/update_expression';
import * as VariableDeclaration from './nodes/variable_declaration';
import * as VariableDeclarator from './nodes/variable_declarator';
import * as ImportDefaultSpecifier from './nodes/import_default_specifier';
import * as ImportNamespaceSpecifier from './nodes/import_namespace_specifier';
import * as ImportSpecifier from './nodes/import_specifier';
import * as ForStatement from './nodes/for_statement';
import * as ThisExpression from './nodes/this_expression';
import * as ForInStatement from './nodes/for_in_statement';


import esprima from 'espree';
import esprimaOptions from './esprima_options';

import defaultConfig from './default_config';
import FormatContext from './format_context';

const NODE_TYPES = {
    ForInStatement,
    ThisExpression,
    ForStatement,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    ArrayExpression,
    ArrowFunctionExpression,
    AssignmentExpression,
    BinaryExpression,
    BlockStatement,
    CallExpression,
    CatchClause,
    ConditionalExpression,
    ExpressionStatement,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    IfStatement,
    ImportDeclaration,
    JSXAttribute,
    JSXClosingElement,
    JSXElement,
    JSXExpressionContainer,
    JSXIdentifier,
    JSXOpeningElement,
    Literal,
    LogicalExpression,
    MemberExpression,
    NewExpression,
    ObjectExpression,
    Program,
    Property,
    ReturnStatement,
    TryStatement,
    UnaryExpression,
    UpdateExpression,
    VariableDeclaration,
    VariableDeclarator,
    ImportDefaultSpecifier
};



/**
 * @param {String} code to be formatted
 * @param {Object} config @see ./default_config.js
 */
export function format(code, config) {
    let ast;

    try {
        ast = esprima.parse(code, esprimaOptions);
    } catch(e) {
        console.error('Failed parsing javascript');
        throw e;
    }

    config = Object.assign({}, defaultConfig, config);

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
function formatAst(node, context, recur) {
    if (!node) {
        throw new Error('`node` argument is required. value: ' + JSON.stringify(node));
    }
    // find the node's namespace based on its type
    const nodeNamespace = NODE_TYPES[node.type];

    // recur function that will hold context and itself in a closule.
    // only if it's not defined (first call)
    recur || (recur = (nextNode) => {
        // console.log('next node: ', nextNode);
        //
        return formatAst(nextNode, context, recur);
    });

    if (!nodeNamespace) {
        throw new Error('unknown node type: ' + node.type);
    }

    return nodeNamespace.format(node, context, recur);
}
