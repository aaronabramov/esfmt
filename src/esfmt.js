/* Copyright 2015, Yahoo Inc. */

import * as ArrayExpression from './nodes/array_expression';
import * as ArrayPattern from './nodes/array_pattern';
import * as ArrowFunctionExpression from './nodes/arrow_function_expression';
import * as AssignmentExpression from './nodes/assignment_expression';
import * as AssignmentPattern from './nodes/assignment_pattern';
import * as BinaryExpression from './nodes/binary_expression';
import * as BlockStatement from './nodes/block_statement';
import * as BreakStatement from './nodes/break_statement';
import * as CallExpression from './nodes/call_expression';
import * as CatchClause from './nodes/catch_clause';
import * as ClassBody from './nodes/class_body';
import * as ClassDeclaration from './nodes/class_declaration';
import * as ConditionalExpression from './nodes/conditional_expression';
import * as ContinueStatement from './nodes/continue_statement';
import * as DebuggerStatement from './nodes/debugger_statement';
import * as DoWhileStatement from './nodes/do_while_statement';
import * as EmptyStatement from './nodes/empty_statement';
import * as ExportDefaultDeclaration from './nodes/export_default_declaration';
import * as ExportNamedDeclaration from './nodes/export_named_declaration';
import * as ExportSpecifier from './nodes/export_specifier';
import * as ExpressionStatement from './nodes/expression_statement';
import * as ForInStatement from './nodes/for_in_statement';
import * as ForOfStatement from './nodes/for_of_statement';
import * as ForStatement from './nodes/for_statement';
import * as FunctionDeclaration from './nodes/function_declaration';
import * as FunctionExpression from './nodes/function_expression';
import * as Identifier from './nodes/identifier';
import * as IfStatement from './nodes/if_statement';
import * as ImportDeclaration from './nodes/import_declaration';
import * as ImportDefaultSpecifier from './nodes/import_default_specifier';
import * as ImportNamespaceSpecifier from './nodes/import_namespace_specifier';
import * as ImportSpecifier from './nodes/import_specifier';
import * as JSXAttribute from './nodes/jsx_attribute';
import * as JSXClosingElement from './nodes/jsx_closing_element';
import * as JSXElement from './nodes/jsx_element';
import * as JSXExpressionContainer from './nodes/jsx_expression_container';
import * as JSXIdentifier from './nodes/jsx_identifier';
import * as JSXOpeningElement from './nodes/jsx_opening_element';
import * as Literal from './nodes/literal';
import * as LogicalExpression from './nodes/logical_expression';
import * as MemberExpression from './nodes/member_expression';
import * as MetaProperty from './nodes/meta_property';
import * as MethodDefinition from './nodes/method_definition';
import * as NewExpression from './nodes/new_expression';
import * as ObjectExpression from './nodes/object_expression';
import * as Program from './nodes/program';
import * as Property from './nodes/property';
import * as RestElement from './nodes/rest_element';
import * as ReturnStatement from './nodes/return_statement';
import * as SequenceExpression from './nodes/sequence_expression';
import * as SpreadElement from './nodes/spread_element';
import * as Super from './nodes/super';
import * as SwitchCase from './nodes/switch_case';
import * as SwitchStatement from './nodes/switch_statement';
import * as TaggedTemplateExpression from './nodes/tagged_template_expression';
import * as TemplateElement from './nodes/template_element';
import * as TemplateLiteral from './nodes/template_literal';
import * as ThisExpression from './nodes/this_expression';
import * as ThrowStatement from './nodes/throw_statement';
import * as TryStatement from './nodes/try_statement';
import * as UnaryExpression from './nodes/unary_expression';
import * as UpdateExpression from './nodes/update_expression';
import * as VariableDeclaration from './nodes/variable_declaration';
import * as VariableDeclarator from './nodes/variable_declarator';
import * as WhileStatement from './nodes/while_statement';
import * as YieldExpression from './nodes/yield_expression';


import esprima from 'espree';
import esprimaOptions from './esprima_options';

import defaultConfig from './default_config';
import Context from './context';
import invariant from './invariant';

import 'babel-polyfill';

const NODE_TYPES = {
    ArrayExpression,
    ArrayPattern,
    ArrowFunctionExpression,
    AssignmentExpression,
    AssignmentPattern,
    BinaryExpression,
    BlockStatement,
    BreakStatement,
    CallExpression,
    CatchClause,
    ClassBody,
    ClassDeclaration,
    ConditionalExpression,
    ContinueStatement,
    DebuggerStatement,
    DoWhileStatement,
    EmptyStatement,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    ExportSpecifier,
    ExpressionStatement,
    ForInStatement,
    ForOfStatement,
    ForStatement,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    IfStatement,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    JSXAttribute,
    JSXClosingElement,
    JSXElement,
    JSXExpressionContainer,
    JSXIdentifier,
    JSXOpeningElement,
    Literal,
    LogicalExpression,
    MemberExpression,
    MetaProperty,
    MethodDefinition,
    NewExpression,
    ObjectExpression,
    Program,
    Property,
    RestElement,
    ReturnStatement,
    SequenceExpression,
    SpreadElement,
    Super,
    SwitchCase,
    SwitchStatement,
    TaggedTemplateExpression,
    TemplateElement,
    TemplateLiteral,
    ThisExpression,
    ThrowStatement,
    TryStatement,
    UnaryExpression,
    UpdateExpression,
    VariableDeclaration,
    VariableDeclarator,
    WhileStatement,
    YieldExpression
};



/**
 * @param {String} code to be formatted
 * @param {Object} config @see ./default_config.js
 */
export function format(code, config) {
    let ast;
    config = config || {};

    try {
        ast = esprima.parse(code, esprimaOptions);
    } catch(e) {
        console.error('Failed parsing javascript'); // eslint-disable-line no-console
        throw e;
    }

    config = JSON.parse(JSON.stringify(config));

    config = Object.assign({}, defaultConfig, config);

    // console.log('AST: \n', JSON.stringify(ast, null, 2));

    let context = new Context(config, ast);

    formatAst(ast, context);

    return context.result;
}

/**
 * Multifunction for formatting an AST node (recursively)
 * dispatches to multiple format functions depending on the node type
 *
 * @param {Object} node esprima node
 * @param {Object} context formatting context object (state)
 */
function formatAst(node, context, recur, options) {
    invariant(
        node,
        `'node' argument is required. value: ${JSON.stringify(node)}`
    );

    // find the node's namespace based on its type
    const nodeNamespace = NODE_TYPES[node.type];

    // recur function that will hold context and itself in a closule.
    // only if it's not defined (first call)
    recur || (recur = (nextNode, nextOptions) => {
        // console.log('next node: ', nextNode);
        formatAst(nextNode, context, recur, nextOptions);
    });

    invariant(nodeNamespace, `unknown node type: ${node.type}`);

    nodeNamespace.format(node, context, recur, options);
}
