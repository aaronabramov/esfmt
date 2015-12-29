'use strict';var _createClass = require('babel-runtime/helpers/create-class')['default'];var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];Object.defineProperty(exports, '__esModule', { value: true });var _block_comments = require('./block_comments');var _block_comments2 = _interopRequireDefault(_block_comments);var 

Context = (function () {
    /**
     * Create a context object for formatting
     *
     * @param {Object} config formatting configuration object
     *  @see ./default_config.js
     * @param {Object} ast parsed ast
     */
    function Context(config, ast) {_classCallCheck(this, Context);
        this.config = config;
        this.currentIndentation = 0;
        this.ast = ast;
        this.comments = ast.comments;
        this.result = '';}_createClass(Context, [{ key: 'indentIn', value: 


        function indentIn() {
            this.currentIndentation++;} }, { key: 'indentOut', value: 


        function indentOut() {
            this.currentIndentation--;}


        // get a whitespace string containing X number of spaces, where
        // X is this.currentIndentation * this.config.indentation
    }, { key: 'getIndent', value: function getIndent() {
            var indent = new Array(this.config.indentation + 1).join(' ');
            return new Array(this.currentIndentation + 1).join(indent);}


        /**
         * Create a BlockComments object that will hold the state of
         * the current block
         *
         * @param {Object} blockNode Programm, BlockStatement, etc.
         */ }, { key: 'blockComments', value: 
        function blockComments(blockNode) {
            return new _block_comments2['default'](this, blockNode);}


        /**
         * return left range of the file
         * @return {Number}
         */ }, { key: 'maxRange', value: 
        function maxRange() {
            var lastCommentRange = undefined;

            if (this.comments.length) {
                lastCommentRange = this.comments[this.comments.length - 1].
                range[1];}


            return Math.max(
            this.ast.range[1], 
            lastCommentRange || 0);} }, { key: 'write', value: 



        function write(str) {
            if (arguments.length > 1) {
                str = '';

                for (var i = 0; i < arguments.length; i++) {
                    str += arguments[i];}}



            this.result += str;}


        /**
         * Lock the result at the current position, later the rollback can be called
         * and everything that was written after the transaction was oppened
         * will be rolled back
         *
         * @example
         *
         *
         * let rollback = context.transaction();
         *
         *  recur(veryLongNode);
         *
         *  if (context.overflown()) {
         *      recur(veriLongNode, {short: true});
         *  }
         *
         */ }, { key: 'transaction', value: 
        function transaction() {
            var _this = this;
            var current = this.result;

            return function rollback() {
                _this.result = current;};}



        /**
         * Return whether any of the lines of the current written result
         * is longer than `config['max-len']` value
         */ }, { key: 'overflown', value: 
        function overflown() {
            var _this = this;

            return this.result.split('\n').some(function (line) {
                return line.length > _this.config['max-len'];});} }]);return Context;})();exports['default'] = Context;module.exports = exports['default'];