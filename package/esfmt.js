/* Copyright 2015, Yahoo Inc. */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _nodesArray_expression = require('./nodes/array_expression');

var ArrayExpression = _interopRequireWildcard(_nodesArray_expression);

var _nodesArrow_function_expression = require('./nodes/arrow_function_expression');

var ArrowFunctionExpression = _interopRequireWildcard(_nodesArrow_function_expression);

var _nodesAssignment_expression = require('./nodes/assignment_expression');

var AssignmentExpression = _interopRequireWildcard(_nodesAssignment_expression);

var _nodesBinary_expression = require('./nodes/binary_expression');

var BinaryExpression = _interopRequireWildcard(_nodesBinary_expression);

var _nodesBlock_statement = require('./nodes/block_statement');

var BlockStatement = _interopRequireWildcard(_nodesBlock_statement);

var _nodesCall_expression = require('./nodes/call_expression');

var CallExpression = _interopRequireWildcard(_nodesCall_expression);

var _nodesCatch_clause = require('./nodes/catch_clause');

var CatchClause = _interopRequireWildcard(_nodesCatch_clause);

var _nodesConditional_expression = require('./nodes/conditional_expression');

var ConditionalExpression = _interopRequireWildcard(_nodesConditional_expression);

var _nodesExpression_statement = require('./nodes/expression_statement');

var ExpressionStatement = _interopRequireWildcard(_nodesExpression_statement);

var _nodesFunction_declaration = require('./nodes/function_declaration');

var FunctionDeclaration = _interopRequireWildcard(_nodesFunction_declaration);

var _nodesFunction_expression = require('./nodes/function_expression');

var FunctionExpression = _interopRequireWildcard(_nodesFunction_expression);

var _nodesIdentifier = require('./nodes/identifier');

var Identifier = _interopRequireWildcard(_nodesIdentifier);

var _nodesIf_statement = require('./nodes/if_statement');

var IfStatement = _interopRequireWildcard(_nodesIf_statement);

var _nodesImport_declaration = require('./nodes/import_declaration');

var ImportDeclaration = _interopRequireWildcard(_nodesImport_declaration);

var _nodesJsx_attribute = require('./nodes/jsx_attribute');

var JSXAttribute = _interopRequireWildcard(_nodesJsx_attribute);

var _nodesJsx_closing_element = require('./nodes/jsx_closing_element');

var JSXClosingElement = _interopRequireWildcard(_nodesJsx_closing_element);

var _nodesJsx_element = require('./nodes/jsx_element');

var JSXElement = _interopRequireWildcard(_nodesJsx_element);

var _nodesJsx_expression_container = require('./nodes/jsx_expression_container');

var JSXExpressionContainer = _interopRequireWildcard(_nodesJsx_expression_container);

var _nodesJsx_identifier = require('./nodes/jsx_identifier');

var JSXIdentifier = _interopRequireWildcard(_nodesJsx_identifier);

var _nodesJsx_opening_element = require('./nodes/jsx_opening_element');

var JSXOpeningElement = _interopRequireWildcard(_nodesJsx_opening_element);

var _nodesLiteral = require('./nodes/literal');

var Literal = _interopRequireWildcard(_nodesLiteral);

var _nodesLogical_expression = require('./nodes/logical_expression');

var LogicalExpression = _interopRequireWildcard(_nodesLogical_expression);

var _nodesMember_expression = require('./nodes/member_expression');

var MemberExpression = _interopRequireWildcard(_nodesMember_expression);

var _nodesNew_expression = require('./nodes/new_expression');

var NewExpression = _interopRequireWildcard(_nodesNew_expression);

var _nodesObject_expression = require('./nodes/object_expression');

var ObjectExpression = _interopRequireWildcard(_nodesObject_expression);

var _nodesProgram = require('./nodes/program');

var Program = _interopRequireWildcard(_nodesProgram);

var _nodesProperty = require('./nodes/property');

var Property = _interopRequireWildcard(_nodesProperty);

var _nodesReturn_statement = require('./nodes/return_statement');

var ReturnStatement = _interopRequireWildcard(_nodesReturn_statement);

var _nodesTry_statement = require('./nodes/try_statement');

var TryStatement = _interopRequireWildcard(_nodesTry_statement);

var _nodesUnary_expression = require('./nodes/unary_expression');

var UnaryExpression = _interopRequireWildcard(_nodesUnary_expression);

var _nodesUpdate_expression = require('./nodes/update_expression');

var UpdateExpression = _interopRequireWildcard(_nodesUpdate_expression);

var _nodesVariable_declaration = require('./nodes/variable_declaration');

var VariableDeclaration = _interopRequireWildcard(_nodesVariable_declaration);

var _nodesVariable_declarator = require('./nodes/variable_declarator');

var VariableDeclarator = _interopRequireWildcard(_nodesVariable_declarator);

var _nodesImport_default_specifier = require('./nodes/import_default_specifier');

var ImportDefaultSpecifier = _interopRequireWildcard(_nodesImport_default_specifier);

var _nodesImport_namespace_specifier = require('./nodes/import_namespace_specifier');

var ImportNamespaceSpecifier = _interopRequireWildcard(_nodesImport_namespace_specifier);

var _nodesImport_specifier = require('./nodes/import_specifier');

var ImportSpecifier = _interopRequireWildcard(_nodesImport_specifier);

var _nodesFor_statement = require('./nodes/for_statement');

var ForStatement = _interopRequireWildcard(_nodesFor_statement);

var _nodesThis_expression = require('./nodes/this_expression');

var ThisExpression = _interopRequireWildcard(_nodesThis_expression);

var _nodesFor_in_statement = require('./nodes/for_in_statement');

var ForInStatement = _interopRequireWildcard(_nodesFor_in_statement);

var _nodesDo_while_statement = require('./nodes/do_while_statement');

var DoWhileStatement = _interopRequireWildcard(_nodesDo_while_statement);

var _nodesThrow_statement = require('./nodes/throw_statement');

var ThrowStatement = _interopRequireWildcard(_nodesThrow_statement);

var _nodesExport_default_declaration = require('./nodes/export_default_declaration');

var ExportDefaultDeclaration = _interopRequireWildcard(_nodesExport_default_declaration);

var _nodesExport_named_declaration = require('./nodes/export_named_declaration');

var ExportNamedDeclaration = _interopRequireWildcard(_nodesExport_named_declaration);

var _nodesExport_specifier = require('./nodes/export_specifier');

var ExportSpecifier = _interopRequireWildcard(_nodesExport_specifier);

var _nodesEmpty_statement = require('./nodes/empty_statement');

var EmptyStatement = _interopRequireWildcard(_nodesEmpty_statement);

var _nodesClass_declaration = require('./nodes/class_declaration');

var ClassDeclaration = _interopRequireWildcard(_nodesClass_declaration);

var _nodesClass_body = require('./nodes/class_body');

var ClassBody = _interopRequireWildcard(_nodesClass_body);

var _nodesMethod_definition = require('./nodes/method_definition');

var MethodDefinition = _interopRequireWildcard(_nodesMethod_definition);

var _nodesRest_element = require('./nodes/rest_element');

var RestElement = _interopRequireWildcard(_nodesRest_element);

var _nodesSuper = require('./nodes/super');

var Super = _interopRequireWildcard(_nodesSuper);

var _nodesSpread_element = require('./nodes/spread_element');

var SpreadElement = _interopRequireWildcard(_nodesSpread_element);

var _nodesSwitch_statement = require('./nodes/switch_statement');

var SwitchStatement = _interopRequireWildcard(_nodesSwitch_statement);

var _nodesSwitch_case = require('./nodes/switch_case');

var SwitchCase = _interopRequireWildcard(_nodesSwitch_case);

var _nodesBreak_statement = require('./nodes/break_statement');

var BreakStatement = _interopRequireWildcard(_nodesBreak_statement);

var _espree = require('espree');

var _espree2 = _interopRequireDefault(_espree);

var _esprima_options = require('./esprima_options');

var _esprima_options2 = _interopRequireDefault(_esprima_options);

var _default_config = require('./default_config');

var _default_config2 = _interopRequireDefault(_default_config);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _invariant = require('./invariant');

var _invariant2 = _interopRequireDefault(_invariant);

require('../polyfills/includes');

var NODE_TYPES = {
    BreakStatement: BreakStatement,
    SwitchCase: SwitchCase,
    SwitchStatement: SwitchStatement,
    SpreadElement: SpreadElement,
    Super: Super,
    RestElement: RestElement,
    MethodDefinition: MethodDefinition,
    ClassBody: ClassBody,
    ClassDeclaration: ClassDeclaration,
    EmptyStatement: EmptyStatement,
    ExportSpecifier: ExportSpecifier,
    ExportNamedDeclaration: ExportNamedDeclaration,
    ExportDefaultDeclaration: ExportDefaultDeclaration,
    ThrowStatement: ThrowStatement,
    DoWhileStatement: DoWhileStatement,
    ForInStatement: ForInStatement,
    ThisExpression: ThisExpression,
    ForStatement: ForStatement,
    ImportNamespaceSpecifier: ImportNamespaceSpecifier,
    ImportSpecifier: ImportSpecifier,
    ArrayExpression: ArrayExpression,
    ArrowFunctionExpression: ArrowFunctionExpression,
    AssignmentExpression: AssignmentExpression,
    BinaryExpression: BinaryExpression,
    BlockStatement: BlockStatement,
    CallExpression: CallExpression,
    CatchClause: CatchClause,
    ConditionalExpression: ConditionalExpression,
    ExpressionStatement: ExpressionStatement,
    FunctionDeclaration: FunctionDeclaration,
    FunctionExpression: FunctionExpression,
    Identifier: Identifier,
    IfStatement: IfStatement,
    ImportDeclaration: ImportDeclaration,
    JSXAttribute: JSXAttribute,
    JSXClosingElement: JSXClosingElement,
    JSXElement: JSXElement,
    JSXExpressionContainer: JSXExpressionContainer,
    JSXIdentifier: JSXIdentifier,
    JSXOpeningElement: JSXOpeningElement,
    Literal: Literal,
    LogicalExpression: LogicalExpression,
    MemberExpression: MemberExpression,
    NewExpression: NewExpression,
    ObjectExpression: ObjectExpression,
    Program: Program,
    Property: Property,
    ReturnStatement: ReturnStatement,
    TryStatement: TryStatement,
    UnaryExpression: UnaryExpression,
    UpdateExpression: UpdateExpression,
    VariableDeclaration: VariableDeclaration,
    VariableDeclarator: VariableDeclarator,
    ImportDefaultSpecifier: ImportDefaultSpecifier
};

/**
 * @param {String} code to be formatted
 * @param {Object} config @see ./default_config.js
 */

function format(code, config) {
    var ast = undefined;
    config = config || {};

    try {
        ast = _espree2['default'].parse(code, _esprima_options2['default']);
    } catch (e) {
        console.error('Failed parsing javascript');
        throw e;
    }

    config = JSON.parse(JSON.stringify(config));

    for (var key in _default_config2['default']) {
        if (_default_config2['default'].hasOwnProperty(key)) {
            if (!config[key]) {
                config[key] = _default_config2['default'][key];
            }
        }
    }

    // console.log('AST: \n', JSON.stringify(ast, null, 2));

    var context = new _context2['default'](config, ast);

    formatAst(ast, context);

    return context.result;
}

;

/**
 * Multifunction for formatting an AST node (recursively)
 * dispatches to multiple format functions depending on the node type
 *
 * @param {Object} node esprima node
 * @param {Object} context formatting context object (state)
 */
function formatAst(node, context, recur, options) {
    (0, _invariant2['default'])(node, '\'node\' argument is required. value: ' + JSON.stringify(node));

    // find the node's namespace based on its type
    var nodeNamespace = NODE_TYPES[node.type];

    // recur function that will hold context and itself in a closule.
    // only if it's not defined (first call)
    recur || (recur = function (nextNode, nextOptions) {
        // console.log('next node: ', nextNode);
        formatAst(nextNode, context, recur, nextOptions);
    });

    (0, _invariant2['default'])(nodeNamespace, 'unknown node type: ' + node.type);

    nodeNamespace.format(node, context, recur, options);
}