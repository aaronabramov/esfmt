(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var esfmt = require('./package/esfmt');

window.esfmt = esfmt;

},{"./package/esfmt":18}],2:[function(require,module,exports){
/*
Copyright (C) 2015 Fred K. Schott <fkschott@gmail.com>
Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>
Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*eslint no-undefined:0, no-use-before-define: 0*/

"use strict";

var syntax = require("./lib/syntax"),
    tokenInfo = require("./lib/token-info"),
    astNodeTypes = require("./lib/ast-node-types"),
    astNodeFactory = require("./lib/ast-node-factory"),
    defaultFeatures = require("./lib/features"),
    Messages = require("./lib/messages"),
    XHTMLEntities = require("./lib/xhtml-entities"),
    StringMap = require("./lib/string-map"),
    commentAttachment = require("./lib/comment-attachment");

var Token = tokenInfo.Token,
    TokenName = tokenInfo.TokenName,
    FnExprTokens = tokenInfo.FnExprTokens,
    Regex = syntax.Regex,
    PropertyKind,
    source,
    strict,
    index,
    lineNumber,
    lineStart,
    length,
    lookahead,
    state,
    extra;

PropertyKind = {
    Data: 1,
    Get: 2,
    Set: 4
};


// Ensure the condition is true, otherwise throw an error.
// This is only to have a better contract semantic, i.e. another safety net
// to catch a logic error. The condition shall be fulfilled in normal case.
// Do NOT use this to enforce a certain condition on any user input.

function assert(condition, message) {
    /* istanbul ignore if */
    if (!condition) {
        throw new Error("ASSERT: " + message);
    }
}

// 7.4 Comments

function addComment(type, value, start, end, loc) {
    var comment;

    assert(typeof start === "number", "Comment must have valid position");

    // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    if (state.lastCommentStart >= start) {
        return;
    }
    state.lastCommentStart = start;

    comment = {
        type: type,
        value: value
    };
    if (extra.range) {
        comment.range = [start, end];
    }
    if (extra.loc) {
        comment.loc = loc;
    }
    extra.comments.push(comment);

    if (extra.attachComment) {
        commentAttachment.addComment(comment);
    }
}

function skipSingleLineComment(offset) {
    var start, loc, ch, comment;

    start = index - offset;
    loc = {
        start: {
            line: lineNumber,
            column: index - lineStart - offset
        }
    };

    while (index < length) {
        ch = source.charCodeAt(index);
        ++index;
        if (syntax.isLineTerminator(ch)) {
            if (extra.comments) {
                comment = source.slice(start + offset, index - 1);
                loc.end = {
                    line: lineNumber,
                    column: index - lineStart - 1
                };
                addComment("Line", comment, start, index - 1, loc);
            }
            if (ch === 13 && source.charCodeAt(index) === 10) {
                ++index;
            }
            ++lineNumber;
            lineStart = index;
            return;
        }
    }

    if (extra.comments) {
        comment = source.slice(start + offset, index);
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };
        addComment("Line", comment, start, index, loc);
    }
}

function skipMultiLineComment() {
    var start, loc, ch, comment;

    if (extra.comments) {
        start = index - 2;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - 2
            }
        };
    }

    while (index < length) {
        ch = source.charCodeAt(index);
        if (syntax.isLineTerminator(ch)) {
            if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
                ++index;
            }
            ++lineNumber;
            ++index;
            lineStart = index;
            if (index >= length) {
                throwError({}, Messages.UnexpectedToken, "ILLEGAL");
            }
        } else if (ch === 0x2A) {
            // Block comment ends with "*/".
            if (source.charCodeAt(index + 1) === 0x2F) {
                ++index;
                ++index;
                if (extra.comments) {
                    comment = source.slice(start + 2, index - 2);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart
                    };
                    addComment("Block", comment, start, index, loc);
                }
                return;
            }
            ++index;
        } else {
            ++index;
        }
    }

    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
}

function skipComment() {
    var ch, start;

    start = (index === 0);
    while (index < length) {
        ch = source.charCodeAt(index);

        if (syntax.isWhiteSpace(ch)) {
            ++index;
        } else if (syntax.isLineTerminator(ch)) {
            ++index;
            if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
                ++index;
            }
            ++lineNumber;
            lineStart = index;
            start = true;
        } else if (ch === 0x2F) { // U+002F is "/"
            ch = source.charCodeAt(index + 1);
            if (ch === 0x2F) {
                ++index;
                ++index;
                skipSingleLineComment(2);
                start = true;
            } else if (ch === 0x2A) {  // U+002A is "*"
                ++index;
                ++index;
                skipMultiLineComment();
            } else {
                break;
            }
        } else if (start && ch === 0x2D) { // U+002D is "-"
            // U+003E is ">"
            if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
                // "-->" is a single-line comment
                index += 3;
                skipSingleLineComment(3);
            } else {
                break;
            }
        } else if (ch === 0x3C) { // U+003C is "<"
            if (source.slice(index + 1, index + 4) === "!--") {
                ++index; // `<`
                ++index; // `!`
                ++index; // `-`
                ++index; // `-`
                skipSingleLineComment(4);
            } else {
                break;
            }
        } else {
            break;
        }
    }
}

function scanHexEscape(prefix) {
    var i, len, ch, code = 0;

    len = (prefix === "u") ? 4 : 2;
    for (i = 0; i < len; ++i) {
        if (index < length && syntax.isHexDigit(source[index])) {
            ch = source[index++];
            code = code * 16 + "0123456789abcdef".indexOf(ch.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code);
}

/**
 * Scans an extended unicode code point escape sequence from source. Throws an
 * error if the sequence is empty or if the code point value is too large.
 * @returns {string} The string created by the Unicode escape sequence.
 * @private
 */
function scanUnicodeCodePointEscape() {
    var ch, code, cu1, cu2;

    ch = source[index];
    code = 0;

    // At least one hex digit is required.
    if (ch === "}") {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    while (index < length) {
        ch = source[index++];
        if (!syntax.isHexDigit(ch)) {
            break;
        }
        code = code * 16 + "0123456789abcdef".indexOf(ch.toLowerCase());
    }

    if (code > 0x10FFFF || ch !== "}") {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    // UTF-16 Encoding
    if (code <= 0xFFFF) {
        return String.fromCharCode(code);
    }
    cu1 = ((code - 0x10000) >> 10) + 0xD800;
    cu2 = ((code - 0x10000) & 1023) + 0xDC00;
    return String.fromCharCode(cu1, cu2);
}

function getEscapedIdentifier() {
    var ch, id;

    ch = source.charCodeAt(index++);
    id = String.fromCharCode(ch);

    // "\u" (U+005C, U+0075) denotes an escaped character.
    if (ch === 0x5C) {
        if (source.charCodeAt(index) !== 0x75) {
            throwError({}, Messages.UnexpectedToken, "ILLEGAL");
        }
        ++index;
        ch = scanHexEscape("u");
        if (!ch || ch === "\\" || !syntax.isIdentifierStart(ch.charCodeAt(0))) {
            throwError({}, Messages.UnexpectedToken, "ILLEGAL");
        }
        id = ch;
    }

    while (index < length) {
        ch = source.charCodeAt(index);
        if (!syntax.isIdentifierPart(ch)) {
            break;
        }
        ++index;
        id += String.fromCharCode(ch);

        // "\u" (U+005C, U+0075) denotes an escaped character.
        if (ch === 0x5C) {
            id = id.substr(0, id.length - 1);
            if (source.charCodeAt(index) !== 0x75) {
                throwError({}, Messages.UnexpectedToken, "ILLEGAL");
            }
            ++index;
            ch = scanHexEscape("u");
            if (!ch || ch === "\\" || !syntax.isIdentifierPart(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, "ILLEGAL");
            }
            id += ch;
        }
    }

    return id;
}

function getIdentifier() {
    var start, ch;

    start = index++;
    while (index < length) {
        ch = source.charCodeAt(index);
        if (ch === 0x5C) {
            // Blackslash (U+005C) marks Unicode escape sequence.
            index = start;
            return getEscapedIdentifier();
        }
        if (syntax.isIdentifierPart(ch)) {
            ++index;
        } else {
            break;
        }
    }

    return source.slice(start, index);
}

function scanIdentifier() {
    var start, id, type;

    start = index;

    // Backslash (U+005C) starts an escaped character.
    id = (source.charCodeAt(index) === 0x5C) ? getEscapedIdentifier() : getIdentifier();

    // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    if (id.length === 1) {
        type = Token.Identifier;
    } else if (syntax.isKeyword(id, strict, extra.ecmaFeatures)) {
        type = Token.Keyword;
    } else if (id === "null") {
        type = Token.NullLiteral;
    } else if (id === "true" || id === "false") {
        type = Token.BooleanLiteral;
    } else {
        type = Token.Identifier;
    }

    return {
        type: type,
        value: id,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}


// 7.7 Punctuators

function scanPunctuator() {
    var start = index,
        code = source.charCodeAt(index),
        code2,
        ch1 = source[index],
        ch2,
        ch3,
        ch4;

    switch (code) {
        // Check for most common single-character punctuators.
        case 40:   // ( open bracket
        case 41:   // ) close bracket
        case 59:   // ; semicolon
        case 44:   // , comma
        case 91:   // [
        case 93:   // ]
        case 58:   // :
        case 63:   // ?
        case 126:  // ~
            ++index;

            if (extra.tokenize && code === 40) {
                extra.openParenToken = extra.tokens.length;
            }

            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };

        case 123:  // { open curly brace
        case 125:  // } close curly brace
            ++index;

            if (extra.tokenize && code === 123) {
                extra.openCurlyToken = extra.tokens.length;
            }

            // lookahead2 function can cause tokens to be scanned twice and in doing so
            // would wreck the curly stack by pushing the same token onto the stack twice.
            // curlyLastIndex ensures each token is pushed or popped exactly once
            if (index > state.curlyLastIndex) {
                state.curlyLastIndex = index;
                if (code === 123) {
                    state.curlyStack.push("{");
                } else {
                    state.curlyStack.pop();
                }
            }

            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };

        default:
            code2 = source.charCodeAt(index + 1);

            // "=" (char #61) marks an assignment or comparison operator.
            if (code2 === 61) {
                switch (code) {
                    case 37:  // %
                    case 38:  // &
                    case 42:  // *:
                    case 43:  // +
                    case 45:  // -
                    case 47:  // /
                    case 60:  // <
                    case 62:  // >
                    case 94:  // ^
                    case 124: // |
                        index += 2;
                        return {
                            type: Token.Punctuator,
                            value: String.fromCharCode(code) + String.fromCharCode(code2),
                            lineNumber: lineNumber,
                            lineStart: lineStart,
                            range: [start, index]
                        };

                    case 33: // !
                    case 61: // =
                        index += 2;

                        // !== and ===
                        if (source.charCodeAt(index) === 61) {
                            ++index;
                        }
                        return {
                            type: Token.Punctuator,
                            value: source.slice(start, index),
                            lineNumber: lineNumber,
                            lineStart: lineStart,
                            range: [start, index]
                        };
                    default:
                        break;
                }
            }
            break;
    }

    // Peek more characters.

    ch2 = source[index + 1];
    ch3 = source[index + 2];
    ch4 = source[index + 3];

    // 4-character punctuator: >>>=

    if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
        if (ch4 === "=") {
            index += 4;
            return {
                type: Token.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    // 3-character punctuators: === !== >>> <<= >>=

    if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
        index += 3;
        return {
            type: Token.Punctuator,
            value: ">>>",
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === "<" && ch2 === "<" && ch3 === "=") {
        index += 3;
        return {
            type: Token.Punctuator,
            value: "<<=",
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === "=") {
        index += 3;
        return {
            type: Token.Punctuator,
            value: ">>=",
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // The ... operator (spread, restParams, JSX, etc.)
    if (extra.ecmaFeatures.spread ||
        extra.ecmaFeatures.restParams ||
        extra.ecmaFeatures.experimentalObjectRestSpread ||
        (extra.ecmaFeatures.jsx && state.inJSXSpreadAttribute)
    ) {
        if (ch1 === "." && ch2 === "." && ch3 === ".") {
            index += 3;
            return {
                type: Token.Punctuator,
                value: "...",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    // Other 2-character punctuators: ++ -- << >> && ||
    if (ch1 === ch2 && ("+-<>&|".indexOf(ch1) >= 0)) {
        index += 2;
        return {
            type: Token.Punctuator,
            value: ch1 + ch2,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // the => for arrow functions
    if (extra.ecmaFeatures.arrowFunctions) {
        if (ch1 === "=" && ch2 === ">") {
            index += 2;
            return {
                type: Token.Punctuator,
                value: "=>",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    if ("<>=!+-*%&|^/".indexOf(ch1) >= 0) {
        ++index;
        return {
            type: Token.Punctuator,
            value: ch1,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    if (ch1 === ".") {
        ++index;
        return {
            type: Token.Punctuator,
            value: ch1,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
}

// 7.8.3 Numeric Literals

function scanHexLiteral(start) {
    var number = "";

    while (index < length) {
        if (!syntax.isHexDigit(source[index])) {
            break;
        }
        number += source[index++];
    }

    if (number.length === 0) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    if (syntax.isIdentifierStart(source.charCodeAt(index))) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    return {
        type: Token.NumericLiteral,
        value: parseInt("0x" + number, 16),
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanBinaryLiteral(start) {
    var ch, number = "";

    while (index < length) {
        ch = source[index];
        if (ch !== "0" && ch !== "1") {
            break;
        }
        number += source[index++];
    }

    if (number.length === 0) {
        // only 0b or 0B
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }


    if (index < length) {
        ch = source.charCodeAt(index);
        /* istanbul ignore else */
        if (syntax.isIdentifierStart(ch) || syntax.isDecimalDigit(ch)) {
            throwError({}, Messages.UnexpectedToken, "ILLEGAL");
        }
    }

    return {
        type: Token.NumericLiteral,
        value: parseInt(number, 2),
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanOctalLiteral(prefix, start) {
    var number, octal;

    if (syntax.isOctalDigit(prefix)) {
        octal = true;
        number = "0" + source[index++];
    } else {
        octal = false;
        ++index;
        number = "";
    }

    while (index < length) {
        if (!syntax.isOctalDigit(source[index])) {
            break;
        }
        number += source[index++];
    }

    if (!octal && number.length === 0) {
        // only 0o or 0O
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    if (syntax.isIdentifierStart(source.charCodeAt(index)) || syntax.isDecimalDigit(source.charCodeAt(index))) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    return {
        type: Token.NumericLiteral,
        value: parseInt(number, 8),
        octal: octal,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanNumericLiteral() {
    var number, start, ch;

    ch = source[index];
    assert(syntax.isDecimalDigit(ch.charCodeAt(0)) || (ch === "."),
        "Numeric literal must start with a decimal digit or a decimal point");

    start = index;
    number = "";
    if (ch !== ".") {
        number = source[index++];
        ch = source[index];

        // Hex number starts with "0x".
        // Octal number starts with "0".
        if (number === "0") {
            if (ch === "x" || ch === "X") {
                ++index;
                return scanHexLiteral(start);
            }

            // Binary number in ES6 starts with '0b'
            if (extra.ecmaFeatures.binaryLiterals) {
                if (ch === "b" || ch === "B") {
                    ++index;
                    return scanBinaryLiteral(start);
                }
            }

            if ((extra.ecmaFeatures.octalLiterals && (ch === "o" || ch === "O")) || syntax.isOctalDigit(ch)) {
                return scanOctalLiteral(ch, start);
            }

            // decimal number starts with "0" such as "09" is illegal.
            if (ch && syntax.isDecimalDigit(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, "ILLEGAL");
            }
        }

        while (syntax.isDecimalDigit(source.charCodeAt(index))) {
            number += source[index++];
        }
        ch = source[index];
    }

    if (ch === ".") {
        number += source[index++];
        while (syntax.isDecimalDigit(source.charCodeAt(index))) {
            number += source[index++];
        }
        ch = source[index];
    }

    if (ch === "e" || ch === "E") {
        number += source[index++];

        ch = source[index];
        if (ch === "+" || ch === "-") {
            number += source[index++];
        }
        if (syntax.isDecimalDigit(source.charCodeAt(index))) {
            while (syntax.isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
        } else {
            throwError({}, Messages.UnexpectedToken, "ILLEGAL");
        }
    }

    if (syntax.isIdentifierStart(source.charCodeAt(index))) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    return {
        type: Token.NumericLiteral,
        value: parseFloat(number),
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

/**
 * Scan a string escape sequence and return its special character.
 * @param {string} ch The starting character of the given sequence.
 * @returns {Object} An object containing the character and a flag
 * if the escape sequence was an octal.
 * @private
 */
function scanEscapeSequence(ch) {
    var code,
        unescaped,
        restore,
        escapedCh,
        octal = false;

    // An escape sequence cannot be empty
    if (!ch) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    if (syntax.isLineTerminator(ch.charCodeAt(0))) {
        ++lineNumber;
        if (ch === "\r" && source[index] === "\n") {
            ++index;
        }
        lineStart = index;
        escapedCh = "";
    } else if (ch === "u" && source[index] === "{") {
        // Handle ES6 extended unicode code point escape sequences.
        if (extra.ecmaFeatures.unicodeCodePointEscapes) {
            ++index;
            escapedCh = scanUnicodeCodePointEscape();
        } else {
            throwError({}, Messages.UnexpectedToken, "ILLEGAL");
        }
    } else if (ch === "u" || ch === "x") {
        // Handle other unicode and hex codes normally
        restore = index;
        unescaped = scanHexEscape(ch);
        if (unescaped) {
            escapedCh = unescaped;
        } else {
            index = restore;
            escapedCh = ch;
        }
    } else if (ch === "n") {
        escapedCh = "\n";
    } else if (ch === "r") {
        escapedCh = "\r";
    } else if (ch === "t") {
        escapedCh = "\t";
    } else if (ch === "b") {
        escapedCh = "\b";
    } else if (ch === "f") {
        escapedCh = "\f";
    } else if (ch === "v") {
        escapedCh = "\v";
    } else if (syntax.isOctalDigit(ch)) {
        code = "01234567".indexOf(ch);

        // \0 is not octal escape sequence
        if (code !== 0) {
            octal = true;
        }

        if (index < length && syntax.isOctalDigit(source[index])) {
            octal = true;
            code = code * 8 + "01234567".indexOf(source[index++]);

            // 3 digits are only allowed when string starts with 0, 1, 2, 3
            if ("0123".indexOf(ch) >= 0 &&
                    index < length &&
                    syntax.isOctalDigit(source[index])) {
                code = code * 8 + "01234567".indexOf(source[index++]);
            }
        }
        escapedCh = String.fromCharCode(code);
    } else {
        escapedCh = ch;
    }

    return {
        ch: escapedCh,
        octal: octal
    };
}

function scanStringLiteral() {
    var str = "",
        ch,
        escapedSequence,
        octal = false,
        start = index,
        startLineNumber = lineNumber,
        startLineStart = lineStart,
        quote = source[index];

    assert((quote === "'" || quote === "\""),
        "String literal must starts with a quote");

    ++index;

    while (index < length) {
        ch = source[index++];

        if (syntax.isLineTerminator(ch.charCodeAt(0))) {
            break;
        } else if (ch === quote) {
            quote = "";
            break;
        } else if (ch === "\\") {
            ch = source[index++];
            escapedSequence = scanEscapeSequence(ch);
            str += escapedSequence.ch;
            octal = escapedSequence.octal || octal;
        } else {
            str += ch;
        }
    }

    if (quote !== "") {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    return {
        type: Token.StringLiteral,
        value: str,
        octal: octal,
        startLineNumber: startLineNumber,
        startLineStart: startLineStart,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

/**
 * Scan a template string and return a token. This scans both the first and
 * subsequent pieces of a template string and assumes that the first backtick
 * or the closing } have already been scanned.
 * @returns {Token} The template string token.
 * @private
 */
function scanTemplate() {
    var cooked = "",
        ch,
        escapedSequence,
        start = index,
        terminated = false,
        tail = false,
        head = (source[index] === "`");

    ++index;

    while (index < length) {
        ch = source[index++];

        if (ch === "`") {
            tail = true;
            terminated = true;
            break;
        } else if (ch === "$") {
            if (source[index] === "{") {
                ++index;
                terminated = true;
                break;
            }
            cooked += ch;
        } else if (ch === "\\") {
            ch = source[index++];
            escapedSequence = scanEscapeSequence(ch);

            if (escapedSequence.octal) {
                throwError({}, Messages.TemplateOctalLiteral);
            }

            cooked += escapedSequence.ch;

        } else if (syntax.isLineTerminator(ch.charCodeAt(0))) {
            ++lineNumber;
            if (ch === "\r" && source[index] === "\n") {
                ++index;
            }
            lineStart = index;
            cooked += "\n";
        } else {
            cooked += ch;
        }
    }

    if (!terminated) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    if (index > state.curlyLastIndex) {
        state.curlyLastIndex = index;

        if (!tail) {
            state.curlyStack.push("template");
        }

        if (!head) {
            state.curlyStack.pop();
        }
    }

    return {
        type: Token.Template,
        value: {
            cooked: cooked,
            raw: source.slice(start + 1, index - ((tail) ? 1 : 2))
        },
        head: head,
        tail: tail,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function testRegExp(pattern, flags) {
    var tmp = pattern,
        validFlags = "gmsi";

    if (extra.ecmaFeatures.regexYFlag) {
        validFlags += "y";
    }

    if (extra.ecmaFeatures.regexUFlag) {
        validFlags += "u";
    }

    if (!RegExp("^[" + validFlags + "]*$").test(flags)) {
        throwError({}, Messages.InvalidRegExpFlag);
    }


    if (flags.indexOf("u") >= 0) {
        // Replace each astral symbol and every Unicode code point
        // escape sequence with a single ASCII symbol to avoid throwing on
        // regular expressions that are only valid in combination with the
        // `/u` flag.
        // Note: replacing with the ASCII symbol `x` might cause false
        // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
        // perfectly valid pattern that is equivalent to `[a-b]`, but it
        // would be replaced by `[x-b]` which throws an error.
        tmp = tmp
            .replace(/\\u\{([0-9a-fA-F]+)\}/g, function ($0, $1) {
                if (parseInt($1, 16) <= 0x10FFFF) {
                    return "x";
                }
                throwError({}, Messages.InvalidRegExp);
            })
            .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
    }

    // First, detect invalid regular expressions.
    try {
        RegExp(tmp);
    } catch (e) {
        throwError({}, Messages.InvalidRegExp);
    }

    // Return a regular expression object for this pattern-flag pair, or
    // `null` in case the current environment doesn't support the flags it
    // uses.
    try {
        return new RegExp(pattern, flags);
    } catch (exception) {
        return null;
    }
}

function scanRegExpBody() {
    var ch, str, classMarker, terminated, body;

    ch = source[index];
    assert(ch === "/", "Regular expression literal must start with a slash");
    str = source[index++];

    classMarker = false;
    terminated = false;
    while (index < length) {
        ch = source[index++];
        str += ch;
        if (ch === "\\") {
            ch = source[index++];
            // ECMA-262 7.8.5
            if (syntax.isLineTerminator(ch.charCodeAt(0))) {
                throwError({}, Messages.UnterminatedRegExp);
            }
            str += ch;
        } else if (syntax.isLineTerminator(ch.charCodeAt(0))) {
            throwError({}, Messages.UnterminatedRegExp);
        } else if (classMarker) {
            if (ch === "]") {
                classMarker = false;
            }
        } else {
            if (ch === "/") {
                terminated = true;
                break;
            } else if (ch === "[") {
                classMarker = true;
            }
        }
    }

    if (!terminated) {
        throwError({}, Messages.UnterminatedRegExp);
    }

    // Exclude leading and trailing slash.
    body = str.substr(1, str.length - 2);
    return {
        value: body,
        literal: str
    };
}

function scanRegExpFlags() {
    var ch, str, flags, restore;

    str = "";
    flags = "";
    while (index < length) {
        ch = source[index];
        if (!syntax.isIdentifierPart(ch.charCodeAt(0))) {
            break;
        }

        ++index;
        if (ch === "\\" && index < length) {
            ch = source[index];
            if (ch === "u") {
                ++index;
                restore = index;
                ch = scanHexEscape("u");
                if (ch) {
                    flags += ch;
                    for (str += "\\u"; restore < index; ++restore) {
                        str += source[restore];
                    }
                } else {
                    index = restore;
                    flags += "u";
                    str += "\\u";
                }
                throwErrorTolerant({}, Messages.UnexpectedToken, "ILLEGAL");
            } else {
                str += "\\";
                throwErrorTolerant({}, Messages.UnexpectedToken, "ILLEGAL");
            }
        } else {
            flags += ch;
            str += ch;
        }
    }

    return {
        value: flags,
        literal: str
    };
}

function scanRegExp() {
    var start, body, flags, value;

    lookahead = null;
    skipComment();
    start = index;

    body = scanRegExpBody();
    flags = scanRegExpFlags();
    value = testRegExp(body.value, flags.value);

    if (extra.tokenize) {
        return {
            type: Token.RegularExpression,
            value: value,
            regex: {
                pattern: body.value,
                flags: flags.value
            },
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    return {
        literal: body.literal + flags.literal,
        value: value,
        regex: {
            pattern: body.value,
            flags: flags.value
        },
        range: [start, index]
    };
}

function collectRegex() {
    var pos, loc, regex, token;

    skipComment();

    pos = index;
    loc = {
        start: {
            line: lineNumber,
            column: index - lineStart
        }
    };

    regex = scanRegExp();
    loc.end = {
        line: lineNumber,
        column: index - lineStart
    };

    /* istanbul ignore next */
    if (!extra.tokenize) {
        // Pop the previous token, which is likely "/" or "/="
        if (extra.tokens.length > 0) {
            token = extra.tokens[extra.tokens.length - 1];
            if (token.range[0] === pos && token.type === "Punctuator") {
                if (token.value === "/" || token.value === "/=") {
                    extra.tokens.pop();
                }
            }
        }

        extra.tokens.push({
            type: "RegularExpression",
            value: regex.literal,
            regex: regex.regex,
            range: [pos, index],
            loc: loc
        });
    }

    return regex;
}

function isIdentifierName(token) {
    return token.type === Token.Identifier ||
        token.type === Token.Keyword ||
        token.type === Token.BooleanLiteral ||
        token.type === Token.NullLiteral;
}

function advanceSlash() {
    var prevToken,
        checkToken;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken = extra.tokens[extra.tokens.length - 1];
    if (!prevToken) {
        // Nothing before that: it cannot be a division.
        return collectRegex();
    }
    if (prevToken.type === "Punctuator") {
        if (prevToken.value === "]") {
            return scanPunctuator();
        }
        if (prevToken.value === ")") {
            checkToken = extra.tokens[extra.openParenToken - 1];
            if (checkToken &&
                    checkToken.type === "Keyword" &&
                    (checkToken.value === "if" ||
                     checkToken.value === "while" ||
                     checkToken.value === "for" ||
                     checkToken.value === "with")) {
                return collectRegex();
            }
            return scanPunctuator();
        }
        if (prevToken.value === "}") {
            // Dividing a function by anything makes little sense,
            // but we have to check for that.
            if (extra.tokens[extra.openCurlyToken - 3] &&
                    extra.tokens[extra.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken = extra.tokens[extra.openCurlyToken - 4];
                if (!checkToken) {
                    return scanPunctuator();
                }
            } else if (extra.tokens[extra.openCurlyToken - 4] &&
                    extra.tokens[extra.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken = extra.tokens[extra.openCurlyToken - 5];
                if (!checkToken) {
                    return collectRegex();
                }
            } else {
                return scanPunctuator();
            }
            // checkToken determines whether the function is
            // a declaration or an expression.
            if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                // It is an expression.
                return scanPunctuator();
            }
            // It is a declaration.
            return collectRegex();
        }
        return collectRegex();
    }
    if (prevToken.type === "Keyword") {
        return collectRegex();
    }
    return scanPunctuator();
}

function advance() {
    var ch,
        allowJSX = extra.ecmaFeatures.jsx,
        allowTemplateStrings = extra.ecmaFeatures.templateStrings;

    /*
     * If JSX isn't allowed or JSX is allowed and we're not inside an JSX child,
     * then skip any comments.
     */
    if (!allowJSX || !state.inJSXChild) {
        skipComment();
    }

    if (index >= length) {
        return {
            type: Token.EOF,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [index, index]
        };
    }

    // if inside an JSX child, then abort regular tokenization
    if (allowJSX && state.inJSXChild) {
        return advanceJSXChild();
    }

    ch = source.charCodeAt(index);

    // Very common: ( and ) and ;
    if (ch === 0x28 || ch === 0x29 || ch === 0x3B) {
        return scanPunctuator();
    }

    // String literal starts with single quote (U+0027) or double quote (U+0022).
    if (ch === 0x27 || ch === 0x22) {
        if (allowJSX && state.inJSXTag) {
            return scanJSXStringLiteral();
        }

        return scanStringLiteral();
    }

    if (allowJSX && state.inJSXTag && syntax.isJSXIdentifierStart(ch)) {
        return scanJSXIdentifier();
    }

    // Template strings start with backtick (U+0096) or closing curly brace (125) and backtick.
    if (allowTemplateStrings) {

        // template strings start with backtick (96) or open curly (125) but only if the open
        // curly closes a previously opened curly from a template.
        if (ch === 96 || (ch === 125 && state.curlyStack[state.curlyStack.length - 1] === "template")) {
            return scanTemplate();
        }
    }

    if (syntax.isIdentifierStart(ch)) {
        return scanIdentifier();
    }

    // Dot (.) U+002E can also start a floating-point number, hence the need
    // to check the next character.
    if (ch === 0x2E) {
        if (syntax.isDecimalDigit(source.charCodeAt(index + 1))) {
            return scanNumericLiteral();
        }
        return scanPunctuator();
    }

    if (syntax.isDecimalDigit(ch)) {
        return scanNumericLiteral();
    }

    // Slash (/) U+002F can also start a regex.
    if (extra.tokenize && ch === 0x2F) {
        return advanceSlash();
    }

    return scanPunctuator();
}

function collectToken() {
    var loc, token, range, value, entry,
        allowJSX = extra.ecmaFeatures.jsx;

    /* istanbul ignore else */
    if (!allowJSX || !state.inJSXChild) {
        skipComment();
    }

    loc = {
        start: {
            line: lineNumber,
            column: index - lineStart
        }
    };

    token = advance();
    loc.end = {
        line: lineNumber,
        column: index - lineStart
    };

    if (token.type !== Token.EOF) {
        range = [token.range[0], token.range[1]];
        value = source.slice(token.range[0], token.range[1]);
        entry = {
            type: TokenName[token.type],
            value: value,
            range: range,
            loc: loc
        };
        if (token.regex) {
            entry.regex = {
                pattern: token.regex.pattern,
                flags: token.regex.flags
            };
        }
        extra.tokens.push(entry);
    }

    return token;
}

function lex() {
    var token;

    token = lookahead;
    index = token.range[1];
    lineNumber = token.lineNumber;
    lineStart = token.lineStart;

    lookahead = (typeof extra.tokens !== "undefined") ? collectToken() : advance();

    index = token.range[1];
    lineNumber = token.lineNumber;
    lineStart = token.lineStart;

    return token;
}

function peek() {
    var pos,
        line,
        start;

    pos = index;
    line = lineNumber;
    start = lineStart;

    lookahead = (typeof extra.tokens !== "undefined") ? collectToken() : advance();

    index = pos;
    lineNumber = line;
    lineStart = start;
}

function lookahead2() {
    var adv, pos, line, start, result;

    // If we are collecting the tokens, don't grab the next one yet.
    /* istanbul ignore next */
    adv = (typeof extra.advance === "function") ? extra.advance : advance;

    pos = index;
    line = lineNumber;
    start = lineStart;

    // Scan for the next immediate token.
    /* istanbul ignore if */
    if (lookahead === null) {
        lookahead = adv();
    }
    index = lookahead.range[1];
    lineNumber = lookahead.lineNumber;
    lineStart = lookahead.lineStart;

    // Grab the token right after.
    result = adv();
    index = pos;
    lineNumber = line;
    lineStart = start;

    return result;
}


//------------------------------------------------------------------------------
// JSX
//------------------------------------------------------------------------------

function getQualifiedJSXName(object) {
    if (object.type === astNodeTypes.JSXIdentifier) {
        return object.name;
    }
    if (object.type === astNodeTypes.JSXNamespacedName) {
        return object.namespace.name + ":" + object.name.name;
    }
    /* istanbul ignore else */
    if (object.type === astNodeTypes.JSXMemberExpression) {
        return (
            getQualifiedJSXName(object.object) + "." +
            getQualifiedJSXName(object.property)
        );
    }
    /* istanbul ignore next */
    throwUnexpected(object);
}

function scanJSXIdentifier() {
    var ch, start, value = "";

    start = index;
    while (index < length) {
        ch = source.charCodeAt(index);
        if (!syntax.isJSXIdentifierPart(ch)) {
            break;
        }
        value += source[index++];
    }

    return {
        type: Token.JSXIdentifier,
        value: value,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanJSXEntity() {
    var ch, str = "", start = index, count = 0, code;
    ch = source[index];
    assert(ch === "&", "Entity must start with an ampersand");
    index++;
    while (index < length && count++ < 10) {
        ch = source[index++];
        if (ch === ";") {
            break;
        }
        str += ch;
    }

    // Well-formed entity (ending was found).
    if (ch === ";") {
        // Numeric entity.
        if (str[0] === "#") {
            if (str[1] === "x") {
                code = +("0" + str.substr(1));
            } else {
                // Removing leading zeros in order to avoid treating as octal in old browsers.
                code = +str.substr(1).replace(Regex.LeadingZeros, "");
            }

            if (!isNaN(code)) {
                return String.fromCharCode(code);
            }
        /* istanbul ignore else */
        } else if (XHTMLEntities[str]) {
            return XHTMLEntities[str];
        }
    }

    // Treat non-entity sequences as regular text.
    index = start + 1;
    return "&";
}

function scanJSXText(stopChars) {
    var ch, str = "", start;
    start = index;
    while (index < length) {
        ch = source[index];
        if (stopChars.indexOf(ch) !== -1) {
            break;
        }
        if (ch === "&") {
            str += scanJSXEntity();
        } else {
            index++;
            if (ch === "\r" && source[index] === "\n") {
                str += ch;
                ch = source[index];
                index++;
            }
            if (syntax.isLineTerminator(ch.charCodeAt(0))) {
                ++lineNumber;
                lineStart = index;
            }
            str += ch;
        }
    }
    return {
        type: Token.JSXText,
        value: str,
        lineNumber: lineNumber,
        lineStart: lineStart,
        range: [start, index]
    };
}

function scanJSXStringLiteral() {
    var innerToken, quote, start;

    quote = source[index];
    assert((quote === "\"" || quote === "'"),
        "String literal must starts with a quote");

    start = index;
    ++index;

    innerToken = scanJSXText([quote]);

    if (quote !== source[index]) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    ++index;

    innerToken.range = [start, index];

    return innerToken;
}

/*
 * Between JSX opening and closing tags (e.g. <foo>HERE</foo>), anything that
 * is not another JSX tag and is not an expression wrapped by {} is text.
 */
function advanceJSXChild() {
    var ch = source.charCodeAt(index);

    // { (123) and < (60)
    if (ch !== 123 && ch !== 60) {
        return scanJSXText(["<", "{"]);
    }

    return scanPunctuator();
}

function parseJSXIdentifier() {
    var token, marker = markerCreate();

    if (lookahead.type !== Token.JSXIdentifier) {
        throwUnexpected(lookahead);
    }

    token = lex();
    return markerApply(marker, astNodeFactory.createJSXIdentifier(token.value));
}

function parseJSXNamespacedName() {
    var namespace, name, marker = markerCreate();

    namespace = parseJSXIdentifier();
    expect(":");
    name = parseJSXIdentifier();

    return markerApply(marker, astNodeFactory.createJSXNamespacedName(namespace, name));
}

function parseJSXMemberExpression() {
    var marker = markerCreate(),
        expr = parseJSXIdentifier();

    while (match(".")) {
        lex();
        expr = markerApply(marker, astNodeFactory.createJSXMemberExpression(expr, parseJSXIdentifier()));
    }

    return expr;
}

function parseJSXElementName() {
    if (lookahead2().value === ":") {
        return parseJSXNamespacedName();
    }
    if (lookahead2().value === ".") {
        return parseJSXMemberExpression();
    }

    return parseJSXIdentifier();
}

function parseJSXAttributeName() {
    if (lookahead2().value === ":") {
        return parseJSXNamespacedName();
    }

    return parseJSXIdentifier();
}

function parseJSXAttributeValue() {
    var value, marker;
    if (match("{")) {
        value = parseJSXExpressionContainer();
        if (value.expression.type === astNodeTypes.JSXEmptyExpression) {
            throwError(
                value,
                "JSX attributes must only be assigned a non-empty " +
                    "expression"
            );
        }
    } else if (match("<")) {
        value = parseJSXElement();
    } else if (lookahead.type === Token.JSXText) {
        marker = markerCreate();
        value = markerApply(marker, astNodeFactory.createLiteralFromSource(lex(), source));
    } else {
        throwError({}, Messages.InvalidJSXAttributeValue);
    }
    return value;
}

function parseJSXEmptyExpression() {
    var marker = markerCreatePreserveWhitespace();
    while (source.charAt(index) !== "}") {
        index++;
    }
    return markerApply(marker, astNodeFactory.createJSXEmptyExpression());
}

function parseJSXExpressionContainer() {
    var expression, origInJSXChild, origInJSXTag, marker = markerCreate();

    origInJSXChild = state.inJSXChild;
    origInJSXTag = state.inJSXTag;
    state.inJSXChild = false;
    state.inJSXTag = false;

    expect("{");

    if (match("}")) {
        expression = parseJSXEmptyExpression();
    } else {
        expression = parseExpression();
    }

    state.inJSXChild = origInJSXChild;
    state.inJSXTag = origInJSXTag;

    expect("}");

    return markerApply(marker, astNodeFactory.createJSXExpressionContainer(expression));
}

function parseJSXSpreadAttribute() {
    var expression, origInJSXChild, origInJSXTag, marker = markerCreate();

    origInJSXChild = state.inJSXChild;
    origInJSXTag = state.inJSXTag;
    state.inJSXChild = false;
    state.inJSXTag = false;
    state.inJSXSpreadAttribute = true;

    expect("{");
    expect("...");

    state.inJSXSpreadAttribute = false;

    expression = parseAssignmentExpression();

    state.inJSXChild = origInJSXChild;
    state.inJSXTag = origInJSXTag;

    expect("}");

    return markerApply(marker, astNodeFactory.createJSXSpreadAttribute(expression));
}

function parseJSXAttribute() {
    var name, marker;

    if (match("{")) {
        return parseJSXSpreadAttribute();
    }

    marker = markerCreate();

    name = parseJSXAttributeName();

    // HTML empty attribute
    if (match("=")) {
        lex();
        return markerApply(marker, astNodeFactory.createJSXAttribute(name, parseJSXAttributeValue()));
    }

    return markerApply(marker, astNodeFactory.createJSXAttribute(name));
}

function parseJSXChild() {
    var token, marker;
    if (match("{")) {
        token = parseJSXExpressionContainer();
    } else if (lookahead.type === Token.JSXText) {
        marker = markerCreatePreserveWhitespace();
        token = markerApply(marker, astNodeFactory.createLiteralFromSource(lex(), source));
    } else {
        token = parseJSXElement();
    }
    return token;
}

function parseJSXClosingElement() {
    var name, origInJSXChild, origInJSXTag, marker = markerCreate();
    origInJSXChild = state.inJSXChild;
    origInJSXTag = state.inJSXTag;
    state.inJSXChild = false;
    state.inJSXTag = true;
    expect("<");
    expect("/");
    name = parseJSXElementName();
    // Because advance() (called by lex() called by expect()) expects there
    // to be a valid token after >, it needs to know whether to look for a
    // standard JS token or an JSX text node
    state.inJSXChild = origInJSXChild;
    state.inJSXTag = origInJSXTag;
    expect(">");
    return markerApply(marker, astNodeFactory.createJSXClosingElement(name));
}

function parseJSXOpeningElement() {
    var name, attributes = [], selfClosing = false, origInJSXChild,
        origInJSXTag, marker = markerCreate();

    origInJSXChild = state.inJSXChild;
    origInJSXTag = state.inJSXTag;
    state.inJSXChild = false;
    state.inJSXTag = true;

    expect("<");

    name = parseJSXElementName();

    while (index < length &&
            lookahead.value !== "/" &&
            lookahead.value !== ">") {
        attributes.push(parseJSXAttribute());
    }

    state.inJSXTag = origInJSXTag;

    if (lookahead.value === "/") {
        expect("/");
        // Because advance() (called by lex() called by expect()) expects
        // there to be a valid token after >, it needs to know whether to
        // look for a standard JS token or an JSX text node
        state.inJSXChild = origInJSXChild;
        expect(">");
        selfClosing = true;
    } else {
        state.inJSXChild = true;
        expect(">");
    }
    return markerApply(marker, astNodeFactory.createJSXOpeningElement(name, attributes, selfClosing));
}

function parseJSXElement() {
    var openingElement, closingElement = null, children = [], origInJSXChild, origInJSXTag, marker = markerCreate();

    origInJSXChild = state.inJSXChild;
    origInJSXTag = state.inJSXTag;
    openingElement = parseJSXOpeningElement();

    if (!openingElement.selfClosing) {
        while (index < length) {
            state.inJSXChild = false; // Call lookahead2() with inJSXChild = false because </ should not be considered in the child
            if (lookahead.value === "<" && lookahead2().value === "/") {
                break;
            }
            state.inJSXChild = true;
            children.push(parseJSXChild());
        }
        state.inJSXChild = origInJSXChild;
        state.inJSXTag = origInJSXTag;
        closingElement = parseJSXClosingElement();
        if (getQualifiedJSXName(closingElement.name) !== getQualifiedJSXName(openingElement.name)) {
            throwError({}, Messages.ExpectedJSXClosingTag, getQualifiedJSXName(openingElement.name));
        }
    }

    /*
     * When (erroneously) writing two adjacent tags like
     *
     *     var x = <div>one</div><div>two</div>;
     *
     * the default error message is a bit incomprehensible. Since it"s
     * rarely (never?) useful to write a less-than sign after an JSX
     * element, we disallow it here in the parser in order to provide a
     * better error message. (In the rare case that the less-than operator
     * was intended, the left tag can be wrapped in parentheses.)
     */
    if (!origInJSXChild && match("<")) {
        throwError(lookahead, Messages.AdjacentJSXElements);
    }

    return markerApply(marker, astNodeFactory.createJSXElement(openingElement, closingElement, children));
}

//------------------------------------------------------------------------------
// Location markers
//------------------------------------------------------------------------------

/**
 * Applies location information to the given node by using the given marker.
 * The marker indicates the point at which the node is said to have to begun
 * in the source code.
 * @param {Object} marker The marker to use for the node.
 * @param {ASTNode} node The AST node to apply location information to.
 * @returns {ASTNode} The node that was passed in.
 * @private
 */
function markerApply(marker, node) {

    // add range information to the node if present
    if (extra.range) {
        node.range = [marker.offset, index];
    }

    // add location information the node if present
    if (extra.loc) {
        node.loc = {
            start: {
                line: marker.line,
                column: marker.col
            },
            end: {
                line: lineNumber,
                column: index - lineStart
            }
        };
        // Attach extra.source information to the location, if present
        if (extra.source) {
            node.loc.source = extra.source;
        }
    }

    // attach leading and trailing comments if requested
    if (extra.attachComment) {
        commentAttachment.processComment(node);
    }

    return node;
}

/**
 * Creates a location marker in the source code. Location markers are used for
 * tracking where tokens and nodes appear in the source code.
 * @returns {Object} A marker object or undefined if the parser doesn't have
 *      any location information.
 * @private
 */
function markerCreate() {

    if (!extra.loc && !extra.range) {
        return undefined;
    }

    skipComment();

    return {
        offset: index,
        line: lineNumber,
        col: index - lineStart
    };
}

/**
 * Creates a location marker in the source code. Location markers are used for
 * tracking where tokens and nodes appear in the source code. This method
 * doesn't skip comments or extra whitespace which is important for JSX.
 * @returns {Object} A marker object or undefined if the parser doesn't have
 *      any location information.
 * @private
 */
function markerCreatePreserveWhitespace() {

    if (!extra.loc && !extra.range) {
        return undefined;
    }

    return {
        offset: index,
        line: lineNumber,
        col: index - lineStart
    };
}


//------------------------------------------------------------------------------
// Syntax Tree Delegate
//------------------------------------------------------------------------------

// Return true if there is a line terminator before the next token.

function peekLineTerminator() {
    var pos, line, start, found;

    pos = index;
    line = lineNumber;
    start = lineStart;
    skipComment();
    found = lineNumber !== line;
    index = pos;
    lineNumber = line;
    lineStart = start;

    return found;
}

// Throw an exception

function throwError(token, messageFormat) {

    var error,
        args = Array.prototype.slice.call(arguments, 2),
        msg = messageFormat.replace(
            /%(\d)/g,
            function (whole, index) {
                assert(index < args.length, "Message reference must be in range");
                return args[index];
            }
        );

    if (typeof token.lineNumber === "number") {
        error = new Error("Line " + token.lineNumber + ": " + msg);
        error.index = token.range[0];
        error.lineNumber = token.lineNumber;
        error.column = token.range[0] - token.lineStart + 1;
    } else {
        error = new Error("Line " + lineNumber + ": " + msg);
        error.index = index;
        error.lineNumber = lineNumber;
        error.column = index - lineStart + 1;
    }

    error.description = msg;
    throw error;
}

function throwErrorTolerant() {
    try {
        throwError.apply(null, arguments);
    } catch (e) {
        if (extra.errors) {
            extra.errors.push(e);
        } else {
            throw e;
        }
    }
}


// Throw an exception because of the token.

function throwUnexpected(token) {

    if (token.type === Token.EOF) {
        throwError(token, Messages.UnexpectedEOS);
    }

    if (token.type === Token.NumericLiteral) {
        throwError(token, Messages.UnexpectedNumber);
    }

    if (token.type === Token.StringLiteral || token.type === Token.JSXText) {
        throwError(token, Messages.UnexpectedString);
    }

    if (token.type === Token.Identifier) {
        throwError(token, Messages.UnexpectedIdentifier);
    }

    if (token.type === Token.Keyword) {
        if (syntax.isFutureReservedWord(token.value)) {
            throwError(token, Messages.UnexpectedReserved);
        } else if (strict && syntax.isStrictModeReservedWord(token.value, extra.ecmaFeatures)) {
            throwErrorTolerant(token, Messages.StrictReservedWord);
            return;
        }
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    if (token.type === Token.Template) {
        throwError(token, Messages.UnexpectedTemplate, token.value.raw);
    }

    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError(token, Messages.UnexpectedToken, token.value);
}

// Expect the next token to match the specified punctuator.
// If not, an exception will be thrown.

function expect(value) {
    var token = lex();
    if (token.type !== Token.Punctuator || token.value !== value) {
        throwUnexpected(token);
    }
}

// Expect the next token to match the specified keyword.
// If not, an exception will be thrown.

function expectKeyword(keyword) {
    var token = lex();
    if (token.type !== Token.Keyword || token.value !== keyword) {
        throwUnexpected(token);
    }
}

// Return true if the next token matches the specified punctuator.

function match(value) {
    return lookahead.type === Token.Punctuator && lookahead.value === value;
}

// Return true if the next token matches the specified keyword

function matchKeyword(keyword) {
    return lookahead.type === Token.Keyword && lookahead.value === keyword;
}

// Return true if the next token matches the specified contextual keyword
// (where an identifier is sometimes a keyword depending on the context)

function matchContextualKeyword(keyword) {
    return lookahead.type === Token.Identifier && lookahead.value === keyword;
}

// Return true if the next token is an assignment operator

function matchAssign() {
    var op;

    if (lookahead.type !== Token.Punctuator) {
        return false;
    }
    op = lookahead.value;
    return op === "=" ||
        op === "*=" ||
        op === "/=" ||
        op === "%=" ||
        op === "+=" ||
        op === "-=" ||
        op === "<<=" ||
        op === ">>=" ||
        op === ">>>=" ||
        op === "&=" ||
        op === "^=" ||
        op === "|=";
}

function consumeSemicolon() {
    var line;

    // Catch the very common case first: immediately a semicolon (U+003B).
    if (source.charCodeAt(index) === 0x3B || match(";")) {
        lex();
        return;
    }

    line = lineNumber;
    skipComment();
    if (lineNumber !== line) {
        return;
    }

    if (lookahead.type !== Token.EOF && !match("}")) {
        throwUnexpected(lookahead);
    }
}

// Return true if provided expression is LeftHandSideExpression

function isLeftHandSide(expr) {
    return expr.type === astNodeTypes.Identifier || expr.type === astNodeTypes.MemberExpression;
}

// 11.1.4 Array Initialiser

function parseArrayInitialiser() {
    var elements = [],
        marker = markerCreate(),
        tmp;

    expect("[");

    while (!match("]")) {
        if (match(",")) {
            lex(); // only get here when you have [a,,] or similar
            elements.push(null);
        } else {
            tmp = parseSpreadOrAssignmentExpression();
            elements.push(tmp);
            if (!(match("]"))) {
                expect(","); // handles the common case of comma-separated values
            }
        }
    }

    expect("]");

    return markerApply(marker, astNodeFactory.createArrayExpression(elements));
}

// 11.1.5 Object Initialiser

function parsePropertyFunction(paramInfo, options) {
    var previousStrict = strict,
        previousYieldAllowed = state.yieldAllowed,
        generator = options ? options.generator : false,
        body;

    state.yieldAllowed = generator;

    /*
     * Esprima uses parseConciseBody() here, which is incorrect. Object literal
     * methods must have braces.
     */
    body = parseFunctionSourceElements();

    if (strict && paramInfo.firstRestricted) {
        throwErrorTolerant(paramInfo.firstRestricted, Messages.StrictParamName);
    }

    if (strict && paramInfo.stricted) {
        throwErrorTolerant(paramInfo.stricted, paramInfo.message);
    }

    strict = previousStrict;
    state.yieldAllowed = previousYieldAllowed;

    return markerApply(options.marker, astNodeFactory.createFunctionExpression(
        null,
        paramInfo.params,
        body,
        generator,
        body.type !== astNodeTypes.BlockStatement
    ));
}

function parsePropertyMethodFunction(options) {
    var previousStrict = strict,
        marker = markerCreate(),
        params,
        method;

    strict = true;

    params = parseParams();

    if (params.stricted) {
        throwErrorTolerant(params.stricted, params.message);
    }

    method = parsePropertyFunction(params, {
        generator: options ? options.generator : false,
        marker: marker
    });

    strict = previousStrict;

    return method;
}

function parseObjectPropertyKey() {
    var marker = markerCreate(),
        token = lex(),
        allowObjectLiteralComputed = extra.ecmaFeatures.objectLiteralComputedProperties,
        expr,
        result;

    // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.

    switch (token.type) {
        case Token.StringLiteral:
        case Token.NumericLiteral:
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return markerApply(marker, astNodeFactory.createLiteralFromSource(token, source));

        case Token.Identifier:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.Keyword:
            return markerApply(marker, astNodeFactory.createIdentifier(token.value));

        case Token.Punctuator:
            if ((!state.inObjectLiteral || allowObjectLiteralComputed) &&
                    token.value === "[") {
                // For computed properties we should skip the [ and ], and
                // capture in marker only the assignment expression itself.
                marker = markerCreate();
                expr = parseAssignmentExpression();
                result = markerApply(marker, expr);
                expect("]");
                return result;
            }

        // no default
    }

    throwUnexpected(token);
}

function lookaheadPropertyName() {
    switch (lookahead.type) {
        case Token.Identifier:
        case Token.StringLiteral:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.NumericLiteral:
        case Token.Keyword:
            return true;
        case Token.Punctuator:
            return lookahead.value === "[";
        // no default
    }
    return false;
}

// This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
// it might be called at a position where there is in fact a short hand identifier pattern or a data property.
// This can only be determined after we consumed up to the left parentheses.
// In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
// is responsible to visit other options.
function tryParseMethodDefinition(token, key, computed, marker) {
    var value, options, methodMarker;

    if (token.type === Token.Identifier) {
        // check for `get` and `set`;

        if (token.value === "get" && lookaheadPropertyName()) {

            computed = match("[");
            key = parseObjectPropertyKey();
            methodMarker = markerCreate();
            expect("(");
            expect(")");

            value = parsePropertyFunction({
                params: [],
                stricted: null,
                firstRestricted: null,
                message: null
            }, {
                marker: methodMarker
            });

            return markerApply(marker, astNodeFactory.createProperty("get", key, value, false, false, computed));

        } else if (token.value === "set" && lookaheadPropertyName()) {
            computed = match("[");
            key = parseObjectPropertyKey();
            methodMarker = markerCreate();
            expect("(");

            options = {
                params: [],
                defaultCount: 0,
                stricted: null,
                firstRestricted: null,
                paramSet: new StringMap()
            };
            if (match(")")) {
                throwErrorTolerant(lookahead, Messages.UnexpectedToken, lookahead.value);
            } else {
                parseParam(options);
            }
            expect(")");

            value = parsePropertyFunction(options, { marker: methodMarker });
            return markerApply(marker, astNodeFactory.createProperty("set", key, value, false, false, computed));
        }
    }

    if (match("(")) {
        value = parsePropertyMethodFunction();
        return markerApply(marker, astNodeFactory.createProperty("init", key, value, true, false, computed));
    }

    // Not a MethodDefinition.
    return null;
}

/**
 * Parses Generator Properties
 * @param {ASTNode} key The property key (usually an identifier).
 * @param {Object} marker The marker to use for the node.
 * @returns {ASTNode} The generator property node.
 */
function parseGeneratorProperty(key, marker) {

    var computed = (lookahead.type === Token.Punctuator && lookahead.value === "[");

    if (!match("(")) {
        throwUnexpected(lex());
    }

    return markerApply(
        marker,
        astNodeFactory.createProperty(
            "init",
            key,
            parsePropertyMethodFunction({ generator: true }),
            true,
            false,
            computed
        )
    );
}

// TODO(nzakas): Update to match Esprima
function parseObjectProperty() {
    var token, key, id, computed, methodMarker, options;
    var allowComputed = extra.ecmaFeatures.objectLiteralComputedProperties,
        allowMethod = extra.ecmaFeatures.objectLiteralShorthandMethods,
        allowShorthand = extra.ecmaFeatures.objectLiteralShorthandProperties,
        allowGenerators = extra.ecmaFeatures.generators,
        allowDestructuring = extra.ecmaFeatures.destructuring,
        allowSpread = extra.ecmaFeatures.experimentalObjectRestSpread,
        marker = markerCreate();

    token = lookahead;
    computed = (token.value === "[" && token.type === Token.Punctuator);

    if (token.type === Token.Identifier || (allowComputed && computed)) {

        id = parseObjectPropertyKey();

        /*
         * Check for getters and setters. Be careful! "get" and "set" are legal
         * method names. It's only a getter or setter if followed by a space.
         */
        if (token.value === "get" &&
                !(match(":") || match("(") || match(",") || match("}"))) {
            computed = (lookahead.value === "[");
            key = parseObjectPropertyKey();
            methodMarker = markerCreate();
            expect("(");
            expect(")");

            return markerApply(
                marker,
                astNodeFactory.createProperty(
                    "get",
                    key,
                    parsePropertyFunction({
                        generator: false
                    }, {
                        marker: methodMarker
                    }),
                    false,
                    false,
                    computed
                )
            );
        }

        if (token.value === "set" &&
                !(match(":") || match("(") || match(",") || match("}"))) {
            computed = (lookahead.value === "[");
            key = parseObjectPropertyKey();
            methodMarker = markerCreate();
            expect("(");

            options = {
                params: [],
                defaultCount: 0,
                stricted: null,
                firstRestricted: null,
                paramSet: new StringMap()
            };

            if (match(")")) {
                throwErrorTolerant(lookahead, Messages.UnexpectedToken, lookahead.value);
            } else {
                parseParam(options);
            }

            expect(")");

            return markerApply(
                marker,
                astNodeFactory.createProperty(
                    "set",
                    key,
                    parsePropertyFunction(options, {
                        marker: methodMarker
                    }),
                    false,
                    false,
                    computed
                )
            );
        }

        // normal property (key:value)
        if (match(":")) {
            lex();
            return markerApply(
                marker,
                astNodeFactory.createProperty(
                    "init",
                    id,
                    parseAssignmentExpression(),
                    false,
                    false,
                    computed
                )
            );
        }

        // method shorthand (key(){...})
        if (allowMethod && match("(")) {
            return markerApply(
                marker,
                astNodeFactory.createProperty(
                    "init",
                    id,
                    parsePropertyMethodFunction({ generator: false }),
                    true,
                    false,
                    computed
                )
            );
        }

        // destructuring defaults (shorthand syntax)
        if (allowDestructuring && match("=")) {
            lex();
            var value = parseAssignmentExpression();
            var prop = markerApply(marker, astNodeFactory.createAssignmentExpression("=", id, value));
            prop.type = astNodeTypes.AssignmentPattern;
            var fullProperty = astNodeFactory.createProperty(
                "init",
                id,
                prop,
                false,
                true, // shorthand
                computed
            );
            return markerApply(marker, fullProperty);
        }

        /*
         * Only other possibility is that this is a shorthand property. Computed
         * properties cannot use shorthand notation, so that's a syntax error.
         * If shorthand properties aren't allow, then this is an automatic
         * syntax error. Destructuring is another case with a similar shorthand syntax.
         */
        if (computed || (!allowShorthand && !allowDestructuring)) {
            throwUnexpected(lookahead);
        }

        // shorthand property
        return markerApply(
            marker,
            astNodeFactory.createProperty(
                "init",
                id,
                id,
                false,
                true,
                false
            )
        );
    }

    // object spread property
    if (allowSpread && match("...")) {
        lex();
        return markerApply(marker, astNodeFactory.createExperimentalSpreadProperty(parseAssignmentExpression()));
    }

    // only possibility in this branch is a shorthand generator
    if (token.type === Token.EOF || token.type === Token.Punctuator) {
        if (!allowGenerators || !match("*") || !allowMethod) {
            throwUnexpected(token);
        }

        lex();

        id = parseObjectPropertyKey();

        return parseGeneratorProperty(id, marker);

    }

    /*
     * If we've made it here, then that means the property name is represented
     * by a string (i.e, { "foo": 2}). The only options here are normal
     * property with a colon or a method.
     */
    key = parseObjectPropertyKey();

    // check for property value
    if (match(":")) {
        lex();
        return markerApply(
            marker,
            astNodeFactory.createProperty(
                "init",
                key,
                parseAssignmentExpression(),
                false,
                false,
                false
            )
        );
    }

    // check for method
    if (allowMethod && match("(")) {
        return markerApply(
            marker,
            astNodeFactory.createProperty(
                "init",
                key,
                parsePropertyMethodFunction(),
                true,
                false,
                false
            )
        );
    }

    // no other options, this is bad
    throwUnexpected(lex());
}

function getFieldName(key) {
    var toString = String;
    if (key.type === astNodeTypes.Identifier) {
        return key.name;
    }
    return toString(key.value);
}

function parseObjectInitialiser() {
    var marker = markerCreate(),
        allowDuplicates = extra.ecmaFeatures.objectLiteralDuplicateProperties,
        properties = [],
        property,
        name,
        propertyFn,
        kind,
        storedKind,
        previousInObjectLiteral = state.inObjectLiteral,
        kindMap = new StringMap();

    state.inObjectLiteral = true;

    expect("{");

    while (!match("}")) {

        property = parseObjectProperty();

        if (!property.computed && property.type.indexOf("Experimental") === -1) {

            name = getFieldName(property.key);
            propertyFn = (property.kind === "get") ? PropertyKind.Get : PropertyKind.Set;
            kind = (property.kind === "init") ? PropertyKind.Data : propertyFn;

            if (kindMap.has(name)) {
                storedKind = kindMap.get(name);
                if (storedKind === PropertyKind.Data) {
                    if (kind === PropertyKind.Data && name === "__proto__" && allowDuplicates) {
                        // Duplicate '__proto__' literal properties are forbidden in ES 6
                        throwErrorTolerant({}, Messages.DuplicatePrototypeProperty);
                    } else if (strict && kind === PropertyKind.Data && !allowDuplicates) {
                        // Duplicate literal properties are only forbidden in ES 5 strict mode
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (storedKind & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                kindMap.set(name, storedKind | kind);
            } else {
                kindMap.set(name, kind);
            }
        }

        properties.push(property);

        if (!match("}")) {
            expect(",");
        }
    }

    expect("}");

    state.inObjectLiteral = previousInObjectLiteral;

    return markerApply(marker, astNodeFactory.createObjectExpression(properties));
}

/**
 * Parse a template string element and return its ASTNode representation
 * @param {Object} option Parsing & scanning options
 * @param {Object} option.head True if this element is the first in the
 *                               template string, false otherwise.
 * @returns {ASTNode} The template element node with marker info applied
 * @private
 */
function parseTemplateElement(option) {
    var marker, token;

    if (lookahead.type !== Token.Template || (option.head && !lookahead.head)) {
        throwError({}, Messages.UnexpectedToken, "ILLEGAL");
    }

    marker = markerCreate();
    token = lex();

    return markerApply(
        marker,
        astNodeFactory.createTemplateElement(
            {
                raw: token.value.raw,
                cooked: token.value.cooked
            },
            token.tail
        )
    );
}

/**
 * Parse a template string literal and return its ASTNode representation
 * @returns {ASTNode} The template literal node with marker info applied
 * @private
 */
function parseTemplateLiteral() {
    var quasi, quasis, expressions, marker = markerCreate();

    quasi = parseTemplateElement({ head: true });
    quasis = [ quasi ];
    expressions = [];

    while (!quasi.tail) {
        expressions.push(parseExpression());
        quasi = parseTemplateElement({ head: false });
        quasis.push(quasi);
    }

    return markerApply(marker, astNodeFactory.createTemplateLiteral(quasis, expressions));
}

// 11.1.6 The Grouping Operator

function parseGroupExpression() {
    var expr;

    expect("(");

    ++state.parenthesisCount;

    expr = parseExpression();

    expect(")");

    return expr;
}


// 11.1 Primary Expressions

function parsePrimaryExpression() {
    var type, token, expr,
        marker,
        allowJSX = extra.ecmaFeatures.jsx,
        allowClasses = extra.ecmaFeatures.classes,
        allowSuper = allowClasses || extra.ecmaFeatures.superInFunctions;

    if (match("(")) {
        return parseGroupExpression();
    }

    if (match("[")) {
        return parseArrayInitialiser();
    }

    if (match("{")) {
        return parseObjectInitialiser();
    }

    if (allowJSX && match("<")) {
        return parseJSXElement();
    }

    type = lookahead.type;
    marker = markerCreate();

    if (type === Token.Identifier) {
        expr = astNodeFactory.createIdentifier(lex().value);
    } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
        if (strict && lookahead.octal) {
            throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
        }
        expr = astNodeFactory.createLiteralFromSource(lex(), source);
    } else if (type === Token.Keyword) {
        if (matchKeyword("function")) {
            return parseFunctionExpression();
        }

        if (allowSuper && matchKeyword("super") && state.inFunctionBody) {
            marker = markerCreate();
            lex();
            return markerApply(marker, astNodeFactory.createSuper());
        }

        if (matchKeyword("this")) {
            marker = markerCreate();
            lex();
            return markerApply(marker, astNodeFactory.createThisExpression());
        }

        if (allowClasses && matchKeyword("class")) {
            return parseClassExpression();
        }

        throwUnexpected(lex());
    } else if (type === Token.BooleanLiteral) {
        token = lex();
        token.value = (token.value === "true");
        expr = astNodeFactory.createLiteralFromSource(token, source);
    } else if (type === Token.NullLiteral) {
        token = lex();
        token.value = null;
        expr = astNodeFactory.createLiteralFromSource(token, source);
    } else if (match("/") || match("/=")) {
        if (typeof extra.tokens !== "undefined") {
            expr = astNodeFactory.createLiteralFromSource(collectRegex(), source);
        } else {
            expr = astNodeFactory.createLiteralFromSource(scanRegExp(), source);
        }
        peek();
    } else if (type === Token.Template) {
        return parseTemplateLiteral();
    } else {
       throwUnexpected(lex());
    }

    return markerApply(marker, expr);
}

// 11.2 Left-Hand-Side Expressions

function parseArguments() {
    var args = [], arg;

    expect("(");
    if (!match(")")) {
        while (index < length) {
            arg = parseSpreadOrAssignmentExpression();
            args.push(arg);

            if (match(")")) {
                break;
            }

            expect(",");
        }
    }

    expect(")");

    return args;
}

function parseSpreadOrAssignmentExpression() {
    if (match("...")) {
        var marker = markerCreate();
        lex();
        return markerApply(marker, astNodeFactory.createSpreadElement(parseAssignmentExpression()));
    }
    return parseAssignmentExpression();
}

function parseNonComputedProperty() {
    var token,
        marker = markerCreate();

    token = lex();

    if (!isIdentifierName(token)) {
        throwUnexpected(token);
    }

    return markerApply(marker, astNodeFactory.createIdentifier(token.value));
}

function parseNonComputedMember() {
    expect(".");

    return parseNonComputedProperty();
}

function parseComputedMember() {
    var expr;

    expect("[");

    expr = parseExpression();

    expect("]");

    return expr;
}

function parseNewExpression() {
    var callee, args,
        marker = markerCreate();

    expectKeyword("new");

    if (extra.ecmaFeatures.newTarget && match(".")) {
        lex();
        if (lookahead.type === Token.Identifier && lookahead.value === "target") {
            if (state.inFunctionBody) {
                lex();
                return markerApply(marker, astNodeFactory.createMetaProperty("new", "target"));
            }
        }

        throwUnexpected(lookahead);
    }

    callee = parseLeftHandSideExpression();
    args = match("(") ? parseArguments() : [];

    return markerApply(marker, astNodeFactory.createNewExpression(callee, args));
}

function parseLeftHandSideExpressionAllowCall() {
    var expr, args,
        previousAllowIn = state.allowIn,
        marker = markerCreate();

    state.allowIn = true;
    expr = matchKeyword("new") ? parseNewExpression() : parsePrimaryExpression();
    state.allowIn = previousAllowIn;

    // only start parsing template literal if the lookahead is a head (beginning with `)
    while (match(".") || match("[") || match("(") || (lookahead.type === Token.Template && lookahead.head)) {
        if (match("(")) {
            args = parseArguments();
            expr = markerApply(marker, astNodeFactory.createCallExpression(expr, args));
        } else if (match("[")) {
            expr = markerApply(marker, astNodeFactory.createMemberExpression("[", expr, parseComputedMember()));
        } else if (match(".")) {
            expr = markerApply(marker, astNodeFactory.createMemberExpression(".", expr, parseNonComputedMember()));
        } else {
            expr = markerApply(marker, astNodeFactory.createTaggedTemplateExpression(expr, parseTemplateLiteral()));
        }
    }

    return expr;
}

function parseLeftHandSideExpression() {
    var expr,
        previousAllowIn = state.allowIn,
        marker = markerCreate();

    expr = matchKeyword("new") ? parseNewExpression() : parsePrimaryExpression();
    state.allowIn = previousAllowIn;

    // only start parsing template literal if the lookahead is a head (beginning with `)
    while (match(".") || match("[") || (lookahead.type === Token.Template && lookahead.head)) {
        if (match("[")) {
            expr = markerApply(marker, astNodeFactory.createMemberExpression("[", expr, parseComputedMember()));
        } else if (match(".")) {
            expr = markerApply(marker, astNodeFactory.createMemberExpression(".", expr, parseNonComputedMember()));
        } else {
            expr = markerApply(marker, astNodeFactory.createTaggedTemplateExpression(expr, parseTemplateLiteral()));
        }
    }

    return expr;
}


// 11.3 Postfix Expressions

function parsePostfixExpression() {
    var expr, token,
        marker = markerCreate();

    expr = parseLeftHandSideExpressionAllowCall();

    if (lookahead.type === Token.Punctuator) {
        if ((match("++") || match("--")) && !peekLineTerminator()) {
            // 11.3.1, 11.3.2
            if (strict && expr.type === astNodeTypes.Identifier && syntax.isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPostfix);
            }

            if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }

            token = lex();
            expr = markerApply(marker, astNodeFactory.createPostfixExpression(token.value, expr));
        }
    }

    return expr;
}

// 11.4 Unary Operators

function parseUnaryExpression() {
    var token, expr,
        marker;

    if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
        expr = parsePostfixExpression();
    } else if (match("++") || match("--")) {
        marker = markerCreate();
        token = lex();
        expr = parseUnaryExpression();
        // 11.4.4, 11.4.5
        if (strict && expr.type === astNodeTypes.Identifier && syntax.isRestrictedWord(expr.name)) {
            throwErrorTolerant({}, Messages.StrictLHSPrefix);
        }

        if (!isLeftHandSide(expr)) {
            throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
        }

        expr = astNodeFactory.createUnaryExpression(token.value, expr);
        expr = markerApply(marker, expr);
    } else if (match("+") || match("-") || match("~") || match("!")) {
        marker = markerCreate();
        token = lex();
        expr = parseUnaryExpression();
        expr = astNodeFactory.createUnaryExpression(token.value, expr);
        expr = markerApply(marker, expr);
    } else if (matchKeyword("delete") || matchKeyword("void") || matchKeyword("typeof")) {
        marker = markerCreate();
        token = lex();
        expr = parseUnaryExpression();
        expr = astNodeFactory.createUnaryExpression(token.value, expr);
        expr = markerApply(marker, expr);
        if (strict && expr.operator === "delete" && expr.argument.type === astNodeTypes.Identifier) {
            throwErrorTolerant({}, Messages.StrictDelete);
        }
    } else {
        expr = parsePostfixExpression();
    }

    return expr;
}

function binaryPrecedence(token, allowIn) {
    var prec = 0;

    if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
        return 0;
    }

    switch (token.value) {
    case "||":
        prec = 1;
        break;

    case "&&":
        prec = 2;
        break;

    case "|":
        prec = 3;
        break;

    case "^":
        prec = 4;
        break;

    case "&":
        prec = 5;
        break;

    case "==":
    case "!=":
    case "===":
    case "!==":
        prec = 6;
        break;

    case "<":
    case ">":
    case "<=":
    case ">=":
    case "instanceof":
        prec = 7;
        break;

    case "in":
        prec = allowIn ? 7 : 0;
        break;

    case "<<":
    case ">>":
    case ">>>":
        prec = 8;
        break;

    case "+":
    case "-":
        prec = 9;
        break;

    case "*":
    case "/":
    case "%":
        prec = 11;
        break;

    default:
        break;
    }

    return prec;
}

// 11.5 Multiplicative Operators
// 11.6 Additive Operators
// 11.7 Bitwise Shift Operators
// 11.8 Relational Operators
// 11.9 Equality Operators
// 11.10 Binary Bitwise Operators
// 11.11 Binary Logical Operators
function parseBinaryExpression() {
    var expr, token, prec, previousAllowIn, stack, right, operator, left, i,
        marker, markers;

    previousAllowIn = state.allowIn;
    state.allowIn = true;

    marker = markerCreate();
    left = parseUnaryExpression();

    token = lookahead;
    prec = binaryPrecedence(token, previousAllowIn);
    if (prec === 0) {
        return left;
    }
    token.prec = prec;
    lex();

    markers = [marker, markerCreate()];
    right = parseUnaryExpression();

    stack = [left, token, right];

    while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {

        // Reduce: make a binary expression from the three topmost entries.
        while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
            right = stack.pop();
            operator = stack.pop().value;
            left = stack.pop();
            expr = astNodeFactory.createBinaryExpression(operator, left, right);
            markers.pop();
            marker = markers.pop();
            markerApply(marker, expr);
            stack.push(expr);
            markers.push(marker);
        }

        // Shift.
        token = lex();
        token.prec = prec;
        stack.push(token);
        markers.push(markerCreate());
        expr = parseUnaryExpression();
        stack.push(expr);
    }

    state.allowIn = previousAllowIn;

    // Final reduce to clean-up the stack.
    i = stack.length - 1;
    expr = stack[i];
    markers.pop();
    while (i > 1) {
        expr = astNodeFactory.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
        i -= 2;
        marker = markers.pop();
        markerApply(marker, expr);
    }

    return expr;
}

// 11.12 Conditional Operator

function parseConditionalExpression() {
    var expr, previousAllowIn, consequent, alternate,
        marker = markerCreate();

    expr = parseBinaryExpression();

    if (match("?")) {
        lex();
        previousAllowIn = state.allowIn;
        state.allowIn = true;
        consequent = parseAssignmentExpression();
        state.allowIn = previousAllowIn;
        expect(":");
        alternate = parseAssignmentExpression();

        expr = astNodeFactory.createConditionalExpression(expr, consequent, alternate);
        markerApply(marker, expr);
    }

    return expr;
}

// [ES6] 14.2 Arrow Function

function parseConciseBody() {
    if (match("{")) {
        return parseFunctionSourceElements();
    }
    return parseAssignmentExpression();
}

function reinterpretAsCoverFormalsList(expressions) {
    var i, len, param, params, options,
        allowRestParams = extra.ecmaFeatures.restParams;

    params = [];
    options = {
        paramSet: new StringMap()
    };

    for (i = 0, len = expressions.length; i < len; i += 1) {
        param = expressions[i];
        if (param.type === astNodeTypes.Identifier) {
            params.push(param);
            validateParam(options, param, param.name);
        }  else if (param.type === astNodeTypes.ObjectExpression || param.type === astNodeTypes.ArrayExpression) {
            reinterpretAsDestructuredParameter(options, param);
            params.push(param);
        } else if (param.type === astNodeTypes.SpreadElement) {
            assert(i === len - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            if (param.argument.type !== astNodeTypes.Identifier) {
                throwError({}, Messages.UnexpectedToken, "[");
            }

            if (!allowRestParams) {
                // can't get correct line/column here :(
                throwError({}, Messages.UnexpectedToken, ".");
            }

            validateParam(options, param.argument, param.argument.name);
            param.type = astNodeTypes.RestElement;
            params.push(param);
        } else if (param.type === astNodeTypes.RestElement) {
            params.push(param);
            validateParam(options, param.argument, param.argument.name);
        } else if (param.type === astNodeTypes.AssignmentExpression) {

            // TODO: Find a less hacky way of doing this
            param.type = astNodeTypes.AssignmentPattern;
            delete param.operator;

            if (param.right.type === astNodeTypes.YieldExpression) {
                if (param.right.argument) {
                    throwUnexpected(lookahead);
                }

                param.right.type = astNodeTypes.Identifier;
                param.right.name = "yield";
                delete param.right.argument;
                delete param.right.delegate;
            }

            params.push(param);
            validateParam(options, param.left, param.left.name);
        } else {
            return null;
        }
    }

    if (options.message === Messages.StrictParamDupe) {
        throwError(
            strict ? options.stricted : options.firstRestricted,
            options.message
        );
    }

    return {
        params: params,
        stricted: options.stricted,
        firstRestricted: options.firstRestricted,
        message: options.message
    };
}

function parseArrowFunctionExpression(options, marker) {
    var previousStrict, body;
    var arrowStart = lineNumber;

    expect("=>");
    previousStrict = strict;

    if (lineNumber > arrowStart) {
        throwError({}, Messages.UnexpectedToken, "=>");
    }

    body = parseConciseBody();

    if (strict && options.firstRestricted) {
        throwError(options.firstRestricted, options.message);
    }
    if (strict && options.stricted) {
        throwErrorTolerant(options.stricted, options.message);
    }

    strict = previousStrict;
    return markerApply(marker, astNodeFactory.createArrowFunctionExpression(
        options.params,
        body,
        body.type !== astNodeTypes.BlockStatement
    ));
}

// 11.13 Assignment Operators

// 12.14.5 AssignmentPattern

function reinterpretAsAssignmentBindingPattern(expr) {
    var i, len, property, element,
        allowDestructuring = extra.ecmaFeatures.destructuring,
        allowRest = extra.ecmaFeatures.experimentalObjectRestSpread;

    if (!allowDestructuring) {
        throwUnexpected(lex());
    }

    if (expr.type === astNodeTypes.ObjectExpression) {
        expr.type = astNodeTypes.ObjectPattern;
        for (i = 0, len = expr.properties.length; i < len; i += 1) {
            property = expr.properties[i];

            if (allowRest && property.type === astNodeTypes.ExperimentalSpreadProperty) {

                // only allow identifiers
                if (property.argument.type !== astNodeTypes.Identifier) {
                    throwErrorTolerant({}, "Invalid object rest.");
                }

                property.type = astNodeTypes.ExperimentalRestProperty;
                return;
            }

            if (property.kind !== "init") {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern(property.value);
        }
    } else if (expr.type === astNodeTypes.ArrayExpression) {
        expr.type = astNodeTypes.ArrayPattern;
        for (i = 0, len = expr.elements.length; i < len; i += 1) {
            element = expr.elements[i];
            /* istanbul ignore else */
            if (element) {
                reinterpretAsAssignmentBindingPattern(element);
            }
        }
    } else if (expr.type === astNodeTypes.Identifier) {
        if (syntax.isRestrictedWord(expr.name)) {
            throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
        }
    } else if (expr.type === astNodeTypes.SpreadElement) {
        reinterpretAsAssignmentBindingPattern(expr.argument);
        if (expr.argument.type === astNodeTypes.ObjectPattern) {
            throwErrorTolerant({}, Messages.ObjectPatternAsSpread);
        }
    } else if (expr.type === "AssignmentExpression" && expr.operator === "=") {
        expr.type = astNodeTypes.AssignmentPattern;
    } else {
        /* istanbul ignore else */
        if (expr.type !== astNodeTypes.MemberExpression &&
            expr.type !== astNodeTypes.CallExpression &&
            expr.type !== astNodeTypes.NewExpression &&
            expr.type !== astNodeTypes.AssignmentPattern
        ) {
            throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
        }
    }
}

// 13.2.3 BindingPattern

function reinterpretAsDestructuredParameter(options, expr) {
    var i, len, property, element,
        allowDestructuring = extra.ecmaFeatures.destructuring;

    if (!allowDestructuring) {
        throwUnexpected(lex());
    }

    if (expr.type === astNodeTypes.ObjectExpression) {
        expr.type = astNodeTypes.ObjectPattern;
        for (i = 0, len = expr.properties.length; i < len; i += 1) {
            property = expr.properties[i];
            if (property.kind !== "init") {
                throwErrorTolerant({}, Messages.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter(options, property.value);
        }
    } else if (expr.type === astNodeTypes.ArrayExpression) {
        expr.type = astNodeTypes.ArrayPattern;
        for (i = 0, len = expr.elements.length; i < len; i += 1) {
            element = expr.elements[i];
            if (element) {
                reinterpretAsDestructuredParameter(options, element);
            }
        }
    } else if (expr.type === astNodeTypes.Identifier) {
        validateParam(options, expr, expr.name);
    } else if (expr.type === astNodeTypes.SpreadElement) {
        // BindingRestElement only allows BindingIdentifier
        if (expr.argument.type !== astNodeTypes.Identifier) {
            throwErrorTolerant({}, Messages.InvalidLHSInFormalsList);
        }
        validateParam(options, expr.argument, expr.argument.name);
    } else if (expr.type === astNodeTypes.AssignmentExpression && expr.operator === "=") {
        expr.type = astNodeTypes.AssignmentPattern;
    } else if (expr.type !== astNodeTypes.AssignmentPattern) {
        throwError({}, Messages.InvalidLHSInFormalsList);
    }
}

function parseAssignmentExpression() {
    var token, left, right, node, params,
        marker,
        startsWithParen = false,
        oldParenthesisCount = state.parenthesisCount,
        allowGenerators = extra.ecmaFeatures.generators;

    // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    if (allowGenerators && ((state.yieldAllowed && matchContextualKeyword("yield")) || (strict && matchKeyword("yield")))) {
        return parseYieldExpression();
    }

    marker = markerCreate();

    if (match("(")) {
        token = lookahead2();
        if ((token.value === ")" && token.type === Token.Punctuator) || token.value === "...") {
            params = parseParams();
            if (!match("=>")) {
                throwUnexpected(lex());
            }
            return parseArrowFunctionExpression(params, marker);
        }
        startsWithParen = true;
    }

    // revert to the previous lookahead style object
    token = lookahead;
    node = left = parseConditionalExpression();

    if (match("=>") &&
            (state.parenthesisCount === oldParenthesisCount ||
            state.parenthesisCount === (oldParenthesisCount + 1))) {
        if (node.type === astNodeTypes.Identifier) {
            params = reinterpretAsCoverFormalsList([ node ]);
        } else if (node.type === astNodeTypes.AssignmentExpression ||
            node.type === astNodeTypes.ArrayExpression ||
            node.type === astNodeTypes.ObjectExpression) {
            if (!startsWithParen) {
                throwUnexpected(lex());
            }
            params = reinterpretAsCoverFormalsList([ node ]);
        } else if (node.type === astNodeTypes.SequenceExpression) {
            params = reinterpretAsCoverFormalsList(node.expressions);
        }

        if (params) {
            state.parenthesisCount--;
            return parseArrowFunctionExpression(params, marker);
        }
    }

    if (matchAssign()) {

        // 11.13.1
        if (strict && left.type === astNodeTypes.Identifier && syntax.isRestrictedWord(left.name)) {
            throwErrorTolerant(token, Messages.StrictLHSAssignment);
        }

        // ES.next draf 11.13 Runtime Semantics step 1
        if (match("=") && (node.type === astNodeTypes.ObjectExpression || node.type === astNodeTypes.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern(node);
        } else if (!isLeftHandSide(node)) {
            throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
        }

        token = lex();
        right = parseAssignmentExpression();
        node = markerApply(marker, astNodeFactory.createAssignmentExpression(token.value, left, right));
    }

    return node;
}

// 11.14 Comma Operator

function parseExpression() {
    var marker = markerCreate(),
        expr = parseAssignmentExpression(),
        expressions = [ expr ],
        sequence, spreadFound;

    if (match(",")) {
        while (index < length) {
            if (!match(",")) {
                break;
            }
            lex();
            expr = parseSpreadOrAssignmentExpression();
            expressions.push(expr);

            if (expr.type === astNodeTypes.SpreadElement) {
                spreadFound = true;
                if (!match(")")) {
                    throwError({}, Messages.ElementAfterSpreadElement);
                }
                break;
            }
        }

        sequence = markerApply(marker, astNodeFactory.createSequenceExpression(expressions));
    }

    if (spreadFound && lookahead2().value !== "=>") {
        throwError({}, Messages.IllegalSpread);
    }

    return sequence || expr;
}

// 12.1 Block

function parseStatementList() {
    var list = [],
        statement;

    while (index < length) {
        if (match("}")) {
            break;
        }
        statement = parseSourceElement();
        if (typeof statement === "undefined") {
            break;
        }
        list.push(statement);
    }

    return list;
}

function parseBlock() {
    var block,
        marker = markerCreate();

    expect("{");

    block = parseStatementList();

    expect("}");

    return markerApply(marker, astNodeFactory.createBlockStatement(block));
}

// 12.2 Variable Statement

function parseVariableIdentifier() {
    var token,
        marker = markerCreate();

    token = lex();

    if (token.type !== Token.Identifier) {
        if (strict && token.type === Token.Keyword && syntax.isStrictModeReservedWord(token.value, extra.ecmaFeatures)) {
            throwErrorTolerant(token, Messages.StrictReservedWord);
        } else {
            throwUnexpected(token);
        }
    }

    return markerApply(marker, astNodeFactory.createIdentifier(token.value));
}

function parseVariableDeclaration(kind) {
    var id,
        marker = markerCreate(),
        init = null;
    if (match("{")) {
        id = parseObjectInitialiser();
        reinterpretAsAssignmentBindingPattern(id);
    } else if (match("[")) {
        id = parseArrayInitialiser();
        reinterpretAsAssignmentBindingPattern(id);
    } else {
        /* istanbul ignore next */
        id = state.allowKeyword ? parseNonComputedProperty() : parseVariableIdentifier();
        // 12.2.1
        if (strict && syntax.isRestrictedWord(id.name)) {
            throwErrorTolerant({}, Messages.StrictVarName);
        }
    }

    // TODO: Verify against feature flags
    if (kind === "const") {
        if (!match("=")) {
            throwError({}, Messages.NoUnintializedConst);
        }
        expect("=");
        init = parseAssignmentExpression();
    } else if (match("=")) {
        lex();
        init = parseAssignmentExpression();
    }

    return markerApply(marker, astNodeFactory.createVariableDeclarator(id, init));
}

function parseVariableDeclarationList(kind) {
    var list = [];

    do {
        list.push(parseVariableDeclaration(kind));
        if (!match(",")) {
            break;
        }
        lex();
    } while (index < length);

    return list;
}

function parseVariableStatement() {
    var declarations;

    expectKeyword("var");

    declarations = parseVariableDeclarationList();

    consumeSemicolon();

    return astNodeFactory.createVariableDeclaration(declarations, "var");
}

// kind may be `const` or `let`
// Both are experimental and not in the specification yet.
// see http://wiki.ecmascript.org/doku.php?id=harmony:const
// and http://wiki.ecmascript.org/doku.php?id=harmony:let
function parseConstLetDeclaration(kind) {
    var declarations,
        marker = markerCreate();

    expectKeyword(kind);

    declarations = parseVariableDeclarationList(kind);

    consumeSemicolon();

    return markerApply(marker, astNodeFactory.createVariableDeclaration(declarations, kind));
}


function parseRestElement() {
    var param,
        marker = markerCreate();

    lex();

    if (match("{")) {
        throwError(lookahead, Messages.ObjectPatternAsRestParameter);
    }

    param = parseVariableIdentifier();

    if (match("=")) {
        throwError(lookahead, Messages.DefaultRestParameter);
    }

    if (!match(")")) {
        throwError(lookahead, Messages.ParameterAfterRestParameter);
    }

    return markerApply(marker, astNodeFactory.createRestElement(param));
}

// 12.3 Empty Statement

function parseEmptyStatement() {
    expect(";");
    return astNodeFactory.createEmptyStatement();
}

// 12.4 Expression Statement

function parseExpressionStatement() {
    var expr = parseExpression();
    consumeSemicolon();
    return astNodeFactory.createExpressionStatement(expr);
}

// 12.5 If statement

function parseIfStatement() {
    var test, consequent, alternate;

    expectKeyword("if");

    expect("(");

    test = parseExpression();

    expect(")");

    consequent = parseStatement();

    if (matchKeyword("else")) {
        lex();
        alternate = parseStatement();
    } else {
        alternate = null;
    }

    return astNodeFactory.createIfStatement(test, consequent, alternate);
}

// 12.6 Iteration Statements

function parseDoWhileStatement() {
    var body, test, oldInIteration;

    expectKeyword("do");

    oldInIteration = state.inIteration;
    state.inIteration = true;

    body = parseStatement();

    state.inIteration = oldInIteration;

    expectKeyword("while");

    expect("(");

    test = parseExpression();

    expect(")");

    if (match(";")) {
        lex();
    }

    return astNodeFactory.createDoWhileStatement(test, body);
}

function parseWhileStatement() {
    var test, body, oldInIteration;

    expectKeyword("while");

    expect("(");

    test = parseExpression();

    expect(")");

    oldInIteration = state.inIteration;
    state.inIteration = true;

    body = parseStatement();

    state.inIteration = oldInIteration;

    return astNodeFactory.createWhileStatement(test, body);
}

function parseForVariableDeclaration() {
    var token, declarations,
        marker = markerCreate();

    token = lex();
    declarations = parseVariableDeclarationList();

    return markerApply(marker, astNodeFactory.createVariableDeclaration(declarations, token.value));
}

function parseForStatement(opts) {
    var init, test, update, left, right, body, operator, oldInIteration;
    var allowForOf = extra.ecmaFeatures.forOf,
        allowBlockBindings = extra.ecmaFeatures.blockBindings;

    init = test = update = null;

    expectKeyword("for");

    expect("(");

    if (match(";")) {
        lex();
    } else {

        if (matchKeyword("var") ||
            (allowBlockBindings && (matchKeyword("let") || matchKeyword("const")))
        ) {
            state.allowIn = false;
            init = parseForVariableDeclaration();
            state.allowIn = true;

            if (init.declarations.length === 1) {
                if (matchKeyword("in") || (allowForOf && matchContextualKeyword("of"))) {
                    operator = lookahead;

                    // TODO: is "var" check here really needed? wasn"t in 1.2.2
                    if (!((operator.value === "in" || init.kind !== "var") && init.declarations[0].init)) {
                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    }
                }
            }

        } else {
            state.allowIn = false;
            init = parseExpression();
            state.allowIn = true;

            if (allowForOf && matchContextualKeyword("of")) {
                operator = lex();
                left = init;
                right = parseExpression();
                init = null;
            } else if (matchKeyword("in")) {
                // LeftHandSideExpression
                if (!isLeftHandSide(init)) {
                    throwErrorTolerant({}, Messages.InvalidLHSInForIn);
                }

                operator = lex();
                left = init;
                right = parseExpression();
                init = null;
            }
        }

        if (typeof left === "undefined") {
            expect(";");
        }
    }

    if (typeof left === "undefined") {

        if (!match(";")) {
            test = parseExpression();
        }
        expect(";");

        if (!match(")")) {
            update = parseExpression();
        }
    }

    expect(")");

    oldInIteration = state.inIteration;
    state.inIteration = true;

    if (!(opts !== undefined && opts.ignoreBody)) {
        body = parseStatement();
    }

    state.inIteration = oldInIteration;

    if (typeof left === "undefined") {
        return astNodeFactory.createForStatement(init, test, update, body);
    }

    if (extra.ecmaFeatures.forOf && operator.value === "of") {
        return astNodeFactory.createForOfStatement(left, right, body);
    }

    return astNodeFactory.createForInStatement(left, right, body);
}

// 12.7 The continue statement

function parseContinueStatement() {
    var label = null;

    expectKeyword("continue");

    // Optimize the most common form: "continue;".
    if (source.charCodeAt(index) === 0x3B) {
        lex();

        if (!state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return astNodeFactory.createContinueStatement(null);
    }

    if (peekLineTerminator()) {
        if (!state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return astNodeFactory.createContinueStatement(null);
    }

    if (lookahead.type === Token.Identifier) {
        label = parseVariableIdentifier();

        if (!state.labelSet.has(label.name)) {
            throwError({}, Messages.UnknownLabel, label.name);
        }
    }

    consumeSemicolon();

    if (label === null && !state.inIteration) {
        throwError({}, Messages.IllegalContinue);
    }

    return astNodeFactory.createContinueStatement(label);
}

// 12.8 The break statement

function parseBreakStatement() {
    var label = null;

    expectKeyword("break");

    // Catch the very common case first: immediately a semicolon (U+003B).
    if (source.charCodeAt(index) === 0x3B) {
        lex();

        if (!(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return astNodeFactory.createBreakStatement(null);
    }

    if (peekLineTerminator()) {
        if (!(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return astNodeFactory.createBreakStatement(null);
    }

    if (lookahead.type === Token.Identifier) {
        label = parseVariableIdentifier();

        if (!state.labelSet.has(label.name)) {
            throwError({}, Messages.UnknownLabel, label.name);
        }
    }

    consumeSemicolon();

    if (label === null && !(state.inIteration || state.inSwitch)) {
        throwError({}, Messages.IllegalBreak);
    }

    return astNodeFactory.createBreakStatement(label);
}

// 12.9 The return statement

function parseReturnStatement() {
    var argument = null;

    expectKeyword("return");

    if (!state.inFunctionBody && !extra.ecmaFeatures.globalReturn) {
        throwErrorTolerant({}, Messages.IllegalReturn);
    }

    // "return" followed by a space and an identifier is very common.
    if (source.charCodeAt(index) === 0x20) {
        if (syntax.isIdentifierStart(source.charCodeAt(index + 1))) {
            argument = parseExpression();
            consumeSemicolon();
            return astNodeFactory.createReturnStatement(argument);
        }
    }

    if (peekLineTerminator()) {
        return astNodeFactory.createReturnStatement(null);
    }

    if (!match(";")) {
        if (!match("}") && lookahead.type !== Token.EOF) {
            argument = parseExpression();
        }
    }

    consumeSemicolon();

    return astNodeFactory.createReturnStatement(argument);
}

// 12.10 The with statement

function parseWithStatement() {
    var object, body;

    if (strict) {
        // TODO(ikarienator): Should we update the test cases instead?
        skipComment();
        throwErrorTolerant({}, Messages.StrictModeWith);
    }

    expectKeyword("with");

    expect("(");

    object = parseExpression();

    expect(")");

    body = parseStatement();

    return astNodeFactory.createWithStatement(object, body);
}

// 12.10 The swith statement

function parseSwitchCase() {
    var test, consequent = [], statement,
        marker = markerCreate();

    if (matchKeyword("default")) {
        lex();
        test = null;
    } else {
        expectKeyword("case");
        test = parseExpression();
    }
    expect(":");

    while (index < length) {
        if (match("}") || matchKeyword("default") || matchKeyword("case")) {
            break;
        }
        statement = parseSourceElement();
        if (typeof statement === "undefined") {
            break;
        }
        consequent.push(statement);
    }

    return markerApply(marker, astNodeFactory.createSwitchCase(test, consequent));
}

function parseSwitchStatement() {
    var discriminant, cases, clause, oldInSwitch, defaultFound;

    expectKeyword("switch");

    expect("(");

    discriminant = parseExpression();

    expect(")");

    expect("{");

    cases = [];

    if (match("}")) {
        lex();
        return astNodeFactory.createSwitchStatement(discriminant, cases);
    }

    oldInSwitch = state.inSwitch;
    state.inSwitch = true;
    defaultFound = false;

    while (index < length) {
        if (match("}")) {
            break;
        }
        clause = parseSwitchCase();
        if (clause.test === null) {
            if (defaultFound) {
                throwError({}, Messages.MultipleDefaultsInSwitch);
            }
            defaultFound = true;
        }
        cases.push(clause);
    }

    state.inSwitch = oldInSwitch;

    expect("}");

    return astNodeFactory.createSwitchStatement(discriminant, cases);
}

// 12.13 The throw statement

function parseThrowStatement() {
    var argument;

    expectKeyword("throw");

    if (peekLineTerminator()) {
        throwError({}, Messages.NewlineAfterThrow);
    }

    argument = parseExpression();

    consumeSemicolon();

    return astNodeFactory.createThrowStatement(argument);
}

// 12.14 The try statement

function parseCatchClause() {
    var param, body,
        marker = markerCreate(),
        allowDestructuring = extra.ecmaFeatures.destructuring,
        options = {
            paramSet: new StringMap()
        };

    expectKeyword("catch");

    expect("(");
    if (match(")")) {
        throwUnexpected(lookahead);
    }

    if (match("[")) {
        if (!allowDestructuring) {
            throwUnexpected(lookahead);
        }
        param = parseArrayInitialiser();
        reinterpretAsDestructuredParameter(options, param);
    } else if (match("{")) {

        if (!allowDestructuring) {
            throwUnexpected(lookahead);
        }
        param = parseObjectInitialiser();
        reinterpretAsDestructuredParameter(options, param);
    } else {
        param = parseVariableIdentifier();
    }

    // 12.14.1
    if (strict && param.name && syntax.isRestrictedWord(param.name)) {
        throwErrorTolerant({}, Messages.StrictCatchVariable);
    }

    expect(")");
    body = parseBlock();
    return markerApply(marker, astNodeFactory.createCatchClause(param, body));
}

function parseTryStatement() {
    var block, handler = null, finalizer = null;

    expectKeyword("try");

    block = parseBlock();

    if (matchKeyword("catch")) {
        handler = parseCatchClause();
    }

    if (matchKeyword("finally")) {
        lex();
        finalizer = parseBlock();
    }

    if (!handler && !finalizer) {
        throwError({}, Messages.NoCatchOrFinally);
    }

    return astNodeFactory.createTryStatement(block, handler, finalizer);
}

// 12.15 The debugger statement

function parseDebuggerStatement() {
    expectKeyword("debugger");

    consumeSemicolon();

    return astNodeFactory.createDebuggerStatement();
}

// 12 Statements

function parseStatement() {
    var type = lookahead.type,
        expr,
        labeledBody,
        marker;

    if (type === Token.EOF) {
        throwUnexpected(lookahead);
    }

    if (type === Token.Punctuator && lookahead.value === "{") {
        return parseBlock();
    }

    marker = markerCreate();

    if (type === Token.Punctuator) {
        switch (lookahead.value) {
            case ";":
                return markerApply(marker, parseEmptyStatement());
            case "{":
                return parseBlock();
            case "(":
                return markerApply(marker, parseExpressionStatement());
            default:
                break;
        }
    }

    marker = markerCreate();

    if (type === Token.Keyword) {
        switch (lookahead.value) {
            case "break":
                return markerApply(marker, parseBreakStatement());
            case "continue":
                return markerApply(marker, parseContinueStatement());
            case "debugger":
                return markerApply(marker, parseDebuggerStatement());
            case "do":
                return markerApply(marker, parseDoWhileStatement());
            case "for":
                return markerApply(marker, parseForStatement());
            case "function":
                return markerApply(marker, parseFunctionDeclaration());
            case "if":
                return markerApply(marker, parseIfStatement());
            case "return":
                return markerApply(marker, parseReturnStatement());
            case "switch":
                return markerApply(marker, parseSwitchStatement());
            case "throw":
                return markerApply(marker, parseThrowStatement());
            case "try":
                return markerApply(marker, parseTryStatement());
            case "var":
                return markerApply(marker, parseVariableStatement());
            case "while":
                return markerApply(marker, parseWhileStatement());
            case "with":
                return markerApply(marker, parseWithStatement());
            default:
                break;
        }
    }

    marker = markerCreate();
    expr = parseExpression();

    // 12.12 Labelled Statements
    if ((expr.type === astNodeTypes.Identifier) && match(":")) {
        lex();

        if (state.labelSet.has(expr.name)) {
            throwError({}, Messages.Redeclaration, "Label", expr.name);
        }

        state.labelSet.set(expr.name, true);
        labeledBody = parseStatement();
        state.labelSet.delete(expr.name);
        return markerApply(marker, astNodeFactory.createLabeledStatement(expr, labeledBody));
    }

    consumeSemicolon();

    return markerApply(marker, astNodeFactory.createExpressionStatement(expr));
}

// 13 Function Definition

// function parseConciseBody() {
//     if (match("{")) {
//         return parseFunctionSourceElements();
//     }
//     return parseAssignmentExpression();
// }

function parseFunctionSourceElements() {
    var sourceElement, sourceElements = [], token, directive, firstRestricted,
        oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesisCount,
        marker = markerCreate();

    expect("{");

    while (index < length) {
        if (lookahead.type !== Token.StringLiteral) {
            break;
        }
        token = lookahead;

        sourceElement = parseSourceElement();
        sourceElements.push(sourceElement);
        if (sourceElement.expression.type !== astNodeTypes.Literal) {
            // this is not directive
            break;
        }
        directive = source.slice(token.range[0] + 1, token.range[1] - 1);
        if (directive === "use strict") {
            strict = true;

            if (firstRestricted) {
                throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted && token.octal) {
                firstRestricted = token;
            }
        }
    }

    oldLabelSet = state.labelSet;
    oldInIteration = state.inIteration;
    oldInSwitch = state.inSwitch;
    oldInFunctionBody = state.inFunctionBody;
    oldParenthesisCount = state.parenthesisCount;

    state.labelSet = new StringMap();
    state.inIteration = false;
    state.inSwitch = false;
    state.inFunctionBody = true;

    while (index < length) {

        if (match("}")) {
            break;
        }

        sourceElement = parseSourceElement();

        if (typeof sourceElement === "undefined") {
            break;
        }

        sourceElements.push(sourceElement);
    }

    expect("}");

    state.labelSet = oldLabelSet;
    state.inIteration = oldInIteration;
    state.inSwitch = oldInSwitch;
    state.inFunctionBody = oldInFunctionBody;
    state.parenthesisCount = oldParenthesisCount;

    return markerApply(marker, astNodeFactory.createBlockStatement(sourceElements));
}

function validateParam(options, param, name) {

    if (strict) {
        if (syntax.isRestrictedWord(name)) {
            options.stricted = param;
            options.message = Messages.StrictParamName;
        }

        if (options.paramSet.has(name)) {
            options.stricted = param;
            options.message = Messages.StrictParamDupe;
        }
    } else if (!options.firstRestricted) {
        if (syntax.isRestrictedWord(name)) {
            options.firstRestricted = param;
            options.message = Messages.StrictParamName;
        } else if (syntax.isStrictModeReservedWord(name, extra.ecmaFeatures)) {
            options.firstRestricted = param;
            options.message = Messages.StrictReservedWord;
        } else if (options.paramSet.has(name)) {
            options.firstRestricted = param;
            options.message = Messages.StrictParamDupe;
        }
    }
    options.paramSet.set(name, true);
}

function parseParam(options) {
    var token, param, def,
        allowRestParams = extra.ecmaFeatures.restParams,
        allowDestructuring = extra.ecmaFeatures.destructuring,
        allowDefaultParams = extra.ecmaFeatures.defaultParams,
        marker = markerCreate();

    token = lookahead;
    if (token.value === "...") {
        if (!allowRestParams) {
            throwUnexpected(lookahead);
        }
        param = parseRestElement();
        validateParam(options, param.argument, param.argument.name);
        options.params.push(param);
        return false;
    }

    if (match("[")) {
        if (!allowDestructuring) {
            throwUnexpected(lookahead);
        }
        param = parseArrayInitialiser();
        reinterpretAsDestructuredParameter(options, param);
    } else if (match("{")) {
        if (!allowDestructuring) {
            throwUnexpected(lookahead);
        }
        param = parseObjectInitialiser();
        reinterpretAsDestructuredParameter(options, param);
    } else {
        param = parseVariableIdentifier();
        validateParam(options, token, token.value);
    }

    if (match("=")) {
        if (allowDefaultParams || allowDestructuring) {
            lex();
            def = parseAssignmentExpression();
            ++options.defaultCount;
        } else {
            throwUnexpected(lookahead);
        }
    }

    if (def) {
        options.params.push(markerApply(
            marker,
            astNodeFactory.createAssignmentPattern(
                param,
                def
            )
        ));
    } else {
        options.params.push(param);
    }

    return !match(")");
}


function parseParams(firstRestricted) {
    var options;

    options = {
        params: [],
        defaultCount: 0,
        firstRestricted: firstRestricted
    };

    expect("(");

    if (!match(")")) {
        options.paramSet = new StringMap();
        while (index < length) {
            if (!parseParam(options)) {
                break;
            }
            expect(",");
        }
    }

    expect(")");

    return {
        params: options.params,
        stricted: options.stricted,
        firstRestricted: options.firstRestricted,
        message: options.message
    };
}

function parseFunctionDeclaration(identifierIsOptional) {
        var id = null, body, token, tmp, firstRestricted, message, previousStrict, previousYieldAllowed, generator,
            marker = markerCreate(),
            allowGenerators = extra.ecmaFeatures.generators;

        expectKeyword("function");

        generator = false;
        if (allowGenerators && match("*")) {
            lex();
            generator = true;
        }

        if (!identifierIsOptional || !match("(")) {

            token = lookahead;

            id = parseVariableIdentifier();

            if (strict) {
                if (syntax.isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (syntax.isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (syntax.isStrictModeReservedWord(token.value, extra.ecmaFeatures)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        previousYieldAllowed = state.yieldAllowed;
        state.yieldAllowed = generator;

        body = parseFunctionSourceElements();

        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && tmp.stricted) {
            throwErrorTolerant(tmp.stricted, message);
        }
        strict = previousStrict;
        state.yieldAllowed = previousYieldAllowed;

        return markerApply(
            marker,
            astNodeFactory.createFunctionDeclaration(
                id,
                tmp.params,
                body,
                generator,
                false
            )
        );
    }

function parseFunctionExpression() {
    var token, id = null, firstRestricted, message, tmp, body, previousStrict, previousYieldAllowed, generator,
        marker = markerCreate(),
        allowGenerators = extra.ecmaFeatures.generators;

    expectKeyword("function");

    generator = false;

    if (allowGenerators && match("*")) {
        lex();
        generator = true;
    }

    if (!match("(")) {
        token = lookahead;
        id = parseVariableIdentifier();
        if (strict) {
            if (syntax.isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (syntax.isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (syntax.isStrictModeReservedWord(token.value, extra.ecmaFeatures)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }
    }

    tmp = parseParams(firstRestricted);
    firstRestricted = tmp.firstRestricted;
    if (tmp.message) {
        message = tmp.message;
    }

    previousStrict = strict;
    previousYieldAllowed = state.yieldAllowed;
    state.yieldAllowed = generator;

    body = parseFunctionSourceElements();

    if (strict && firstRestricted) {
        throwError(firstRestricted, message);
    }
    if (strict && tmp.stricted) {
        throwErrorTolerant(tmp.stricted, message);
    }
    strict = previousStrict;
    state.yieldAllowed = previousYieldAllowed;

    return markerApply(
        marker,
        astNodeFactory.createFunctionExpression(
            id,
            tmp.params,
            body,
            generator,
            false
        )
    );
}

function parseYieldExpression() {
    var yieldToken, delegateFlag, expr, marker = markerCreate();

    yieldToken = lex();
    assert(yieldToken.value === "yield", "Called parseYieldExpression with non-yield lookahead.");

    if (!state.yieldAllowed) {
        throwErrorTolerant({}, Messages.IllegalYield);
    }

    delegateFlag = false;
    if (match("*")) {
        lex();
        delegateFlag = true;
    }

    if (peekLineTerminator()) {
        return markerApply(marker, astNodeFactory.createYieldExpression(null, delegateFlag));
    }

    if (!match(";") && !match(")")) {
        if (!match("}") && lookahead.type !== Token.EOF) {
            expr = parseAssignmentExpression();
        }
    }

    return markerApply(marker, astNodeFactory.createYieldExpression(expr, delegateFlag));
}

// Modules grammar from:
// people.mozilla.org/~jorendorff/es6-draft.html

function parseModuleSpecifier() {
    var marker = markerCreate(),
        specifier;

    if (lookahead.type !== Token.StringLiteral) {
        throwError({}, Messages.InvalidModuleSpecifier);
    }
    specifier = astNodeFactory.createLiteralFromSource(lex(), source);
    return markerApply(marker, specifier);
}

function parseExportSpecifier() {
    var exported, local, marker = markerCreate();
    if (matchKeyword("default")) {
        lex();
        local = markerApply(marker, astNodeFactory.createIdentifier("default"));
        // export {default} from "something";
    } else {
        local = parseVariableIdentifier();
    }
    if (matchContextualKeyword("as")) {
        lex();
        exported = parseNonComputedProperty();
    }
    return markerApply(marker, astNodeFactory.createExportSpecifier(local, exported));
}

function parseExportNamedDeclaration() {
    var declaration = null,
        isExportFromIdentifier,
        src = null, specifiers = [],
        marker = markerCreate();

    expectKeyword("export");

    // non-default export
    if (lookahead.type === Token.Keyword) {
        // covers:
        // export var f = 1;
        switch (lookahead.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                declaration = parseSourceElement();
                return markerApply(marker, astNodeFactory.createExportNamedDeclaration(declaration, specifiers, null));
            default:
                break;
        }
    }

    expect("{");
    if (!match("}")) {
        do {
            isExportFromIdentifier = isExportFromIdentifier || matchKeyword("default");
            specifiers.push(parseExportSpecifier());
        } while (match(",") && lex() && !match("}"));
    }
    expect("}");

    if (matchContextualKeyword("from")) {
        // covering:
        // export {default} from "foo";
        // export {foo} from "foo";
        lex();
        src = parseModuleSpecifier();
        consumeSemicolon();
    } else if (isExportFromIdentifier) {
        // covering:
        // export {default}; // missing fromClause
        throwError({}, lookahead.value ?
                Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
    } else {
        // cover
        // export {foo};
        consumeSemicolon();
    }
    return markerApply(marker, astNodeFactory.createExportNamedDeclaration(declaration, specifiers, src));
}

function parseExportDefaultDeclaration() {
    var declaration = null,
        expression = null,
        possibleIdentifierToken,
        allowClasses = extra.ecmaFeatures.classes,
        marker = markerCreate();

    // covers:
    // export default ...
    expectKeyword("export");
    expectKeyword("default");

    if (matchKeyword("function") || matchKeyword("class")) {
        possibleIdentifierToken = lookahead2();
        if (possibleIdentifierToken.type === Token.Identifier) {
            // covers:
            // export default function foo () {}
            // export default class foo {}
            declaration = parseSourceElement();
            return markerApply(marker, astNodeFactory.createExportDefaultDeclaration(declaration));
        }
        // covers:
        // export default function () {}
        // export default class {}
        if (lookahead.value === "function") {
            declaration = parseFunctionDeclaration(true);
            return markerApply(marker, astNodeFactory.createExportDefaultDeclaration(declaration));
        } else if (allowClasses && lookahead.value === "class") {
            declaration = parseClassDeclaration(true);
            return markerApply(marker, astNodeFactory.createExportDefaultDeclaration(declaration));
        }
    }

    if (matchContextualKeyword("from")) {
        throwError({}, Messages.UnexpectedToken, lookahead.value);
    }

    // covers:
    // export default {};
    // export default [];
    // export default (1 + 2);
    if (match("{")) {
        expression = parseObjectInitialiser();
    } else if (match("[")) {
        expression = parseArrayInitialiser();
    } else {
        expression = parseAssignmentExpression();
    }
    consumeSemicolon();
    return markerApply(marker, astNodeFactory.createExportDefaultDeclaration(expression));
}


function parseExportAllDeclaration() {
    var src,
        marker = markerCreate();

    // covers:
    // export * from "foo";
    expectKeyword("export");
    expect("*");
    if (!matchContextualKeyword("from")) {
        throwError({}, lookahead.value ?
                Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
    }
    lex();
    src = parseModuleSpecifier();
    consumeSemicolon();

    return markerApply(marker, astNodeFactory.createExportAllDeclaration(src));
}

function parseExportDeclaration() {
    if (state.inFunctionBody) {
        throwError({}, Messages.IllegalExportDeclaration);
    }
    var declarationType = lookahead2().value;
    if (declarationType === "default") {
        return parseExportDefaultDeclaration();
    } else if (declarationType === "*") {
        return parseExportAllDeclaration();
    } else {
        return parseExportNamedDeclaration();
    }
}

function parseImportSpecifier() {
    // import {<foo as bar>} ...;
    var local, imported, marker = markerCreate();

    imported = parseNonComputedProperty();
    if (matchContextualKeyword("as")) {
        lex();
        local = parseVariableIdentifier();
    }

    return markerApply(marker, astNodeFactory.createImportSpecifier(local, imported));
}

function parseNamedImports() {
    var specifiers = [];
    // {foo, bar as bas}
    expect("{");
    if (!match("}")) {
        do {
            specifiers.push(parseImportSpecifier());
        } while (match(",") && lex() && !match("}"));
    }
    expect("}");
    return specifiers;
}

function parseImportDefaultSpecifier() {
    // import <foo> ...;
    var local, marker = markerCreate();

    local = parseNonComputedProperty();

    return markerApply(marker, astNodeFactory.createImportDefaultSpecifier(local));
}

function parseImportNamespaceSpecifier() {
    // import <* as foo> ...;
    var local, marker = markerCreate();

    expect("*");
    if (!matchContextualKeyword("as")) {
        throwError({}, Messages.NoAsAfterImportNamespace);
    }
    lex();
    local = parseNonComputedProperty();

    return markerApply(marker, astNodeFactory.createImportNamespaceSpecifier(local));
}

function parseImportDeclaration() {
    var specifiers, src, marker = markerCreate();

    if (state.inFunctionBody) {
        throwError({}, Messages.IllegalImportDeclaration);
    }

    expectKeyword("import");
    specifiers = [];

    if (lookahead.type === Token.StringLiteral) {
        // covers:
        // import "foo";
        src = parseModuleSpecifier();
        consumeSemicolon();
        return markerApply(marker, astNodeFactory.createImportDeclaration(specifiers, src));
    }

    if (!matchKeyword("default") && isIdentifierName(lookahead)) {
        // covers:
        // import foo
        // import foo, ...
        specifiers.push(parseImportDefaultSpecifier());
        if (match(",")) {
            lex();
        }
    }
    if (match("*")) {
        // covers:
        // import foo, * as foo
        // import * as foo
        specifiers.push(parseImportNamespaceSpecifier());
    } else if (match("{")) {
        // covers:
        // import foo, {bar}
        // import {bar}
        specifiers = specifiers.concat(parseNamedImports());
    }

    if (!matchContextualKeyword("from")) {
        throwError({}, lookahead.value ?
                Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
    }
    lex();
    src = parseModuleSpecifier();
    consumeSemicolon();

    return markerApply(marker, astNodeFactory.createImportDeclaration(specifiers, src));
}

// 14 Functions and classes

// 14.1 Functions is defined above (13 in ES5)
// 14.2 Arrow Functions Definitions is defined in (7.3 assignments)

// 14.3 Method Definitions
// 14.3.7

// 14.5 Class Definitions

function parseClassBody() {
    var hasConstructor = false, generator = false,
        allowGenerators = extra.ecmaFeatures.generators,
        token, isStatic, body = [], method, computed, key;

    var existingProps = {},
        topMarker = markerCreate(),
        marker;

    existingProps.static = new StringMap();
    existingProps.prototype = new StringMap();

    expect("{");

    while (!match("}")) {

        // extra semicolons are fine
        if (match(";")) {
            lex();
            continue;
        }

        token = lookahead;
        isStatic = false;
        generator = match("*");
        computed = match("[");
        marker = markerCreate();

        if (generator) {
            if (!allowGenerators) {
                throwUnexpected(lookahead);
            }
            lex();
        }

        key = parseObjectPropertyKey();

        // static generator methods
        if (key.name === "static" && match("*")) {
            if (!allowGenerators) {
                throwUnexpected(lookahead);
            }
            generator = true;
            lex();
        }

        if (key.name === "static" && lookaheadPropertyName()) {
            token = lookahead;
            isStatic = true;
            computed = match("[");
            key = parseObjectPropertyKey();
        }

        if (generator) {
            method = parseGeneratorProperty(key, marker);
        } else {
            method = tryParseMethodDefinition(token, key, computed, marker, generator);
        }

        if (method) {
            method.static = isStatic;
            if (method.kind === "init") {
                method.kind = "method";
            }

            if (!isStatic) {

                if (!method.computed && (method.key.name || (method.key.value && method.key.value.toString())) === "constructor") {
                    if (method.kind !== "method" || !method.method || method.value.generator) {
                        throwUnexpected(token, Messages.ConstructorSpecialMethod);
                    }
                    if (hasConstructor) {
                        throwUnexpected(token, Messages.DuplicateConstructor);
                    } else {
                        hasConstructor = true;
                    }
                    method.kind = "constructor";
                }
            } else {
                if (!method.computed && (method.key.name || method.key.value.toString()) === "prototype") {
                    throwUnexpected(token, Messages.StaticPrototype);
                }
            }
            method.type = astNodeTypes.MethodDefinition;
            delete method.method;
            delete method.shorthand;
            body.push(method);
        } else {
            throwUnexpected(lookahead);
        }
    }

    lex();
    return markerApply(topMarker, astNodeFactory.createClassBody(body));
}

function parseClassExpression() {
    var id = null, superClass = null, marker = markerCreate(),
        previousStrict = strict, classBody;

    // classes run in strict mode
    strict = true;

    expectKeyword("class");

    if (lookahead.type === Token.Identifier) {
        id = parseVariableIdentifier();
    }

    if (matchKeyword("extends")) {
        lex();
        superClass = parseLeftHandSideExpressionAllowCall();
    }

    classBody = parseClassBody();
    strict = previousStrict;

    return markerApply(marker, astNodeFactory.createClassExpression(id, superClass, classBody));
}

function parseClassDeclaration(identifierIsOptional) {
    var id = null, superClass = null, marker = markerCreate(),
        previousStrict = strict, classBody;

    // classes run in strict mode
    strict = true;

    expectKeyword("class");

    if (!identifierIsOptional || lookahead.type === Token.Identifier) {
        id = parseVariableIdentifier();
    }

    if (matchKeyword("extends")) {
        lex();
        superClass = parseLeftHandSideExpressionAllowCall();
    }

    classBody = parseClassBody();
    strict = previousStrict;

    return markerApply(marker, astNodeFactory.createClassDeclaration(id, superClass, classBody));
}

// 15 Program

function parseSourceElement() {

    var allowClasses = extra.ecmaFeatures.classes,
        allowModules = extra.ecmaFeatures.modules,
        allowBlockBindings = extra.ecmaFeatures.blockBindings;

    if (lookahead.type === Token.Keyword) {
        switch (lookahead.value) {
            case "export":
                if (!allowModules) {
                    throwErrorTolerant({}, Messages.IllegalExportDeclaration);
                }
                return parseExportDeclaration();
            case "import":
                if (!allowModules) {
                    throwErrorTolerant({}, Messages.IllegalImportDeclaration);
                }
                return parseImportDeclaration();
            case "function":
                return parseFunctionDeclaration();
            case "class":
                if (allowClasses) {
                    return parseClassDeclaration();
                }
                break;
            case "const":
            case "let":
                if (allowBlockBindings) {
                    return parseConstLetDeclaration(lookahead.value);
                }
                /* falls through */
            default:
                return parseStatement();
        }
    }

    if (lookahead.type !== Token.EOF) {
        return parseStatement();
    }
}

function parseSourceElements() {
    var sourceElement, sourceElements = [], token, directive, firstRestricted;

    while (index < length) {
        token = lookahead;
        if (token.type !== Token.StringLiteral) {
            break;
        }

        sourceElement = parseSourceElement();
        sourceElements.push(sourceElement);
        if (sourceElement.expression.type !== astNodeTypes.Literal) {
            // this is not directive
            break;
        }
        directive = source.slice(token.range[0] + 1, token.range[1] - 1);
        if (directive === "use strict") {
            strict = true;
            if (firstRestricted) {
                throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted && token.octal) {
                firstRestricted = token;
            }
        }
    }

    while (index < length) {
        sourceElement = parseSourceElement();
        /* istanbul ignore if */
        if (typeof sourceElement === "undefined") {
            break;
        }
        sourceElements.push(sourceElement);
    }
    return sourceElements;
}

function parseProgram() {
    var body,
        marker,
        isModule = !!extra.ecmaFeatures.modules;

    skipComment();
    peek();
    marker = markerCreate();
    strict = isModule;

    body = parseSourceElements();
    return markerApply(marker, astNodeFactory.createProgram(body, isModule ? "module" : "script"));
}

function filterTokenLocation() {
    var i, entry, token, tokens = [];

    for (i = 0; i < extra.tokens.length; ++i) {
        entry = extra.tokens[i];
        token = {
            type: entry.type,
            value: entry.value
        };
        if (entry.regex) {
            token.regex = {
                pattern: entry.regex.pattern,
                flags: entry.regex.flags
            };
        }
        if (extra.range) {
            token.range = entry.range;
        }
        if (extra.loc) {
            token.loc = entry.loc;
        }
        tokens.push(token);
    }

    extra.tokens = tokens;
}

//------------------------------------------------------------------------------
// Tokenizer
//------------------------------------------------------------------------------

function tokenize(code, options) {
    var toString,
        tokens;

    toString = String;
    if (typeof code !== "string" && !(code instanceof String)) {
        code = toString(code);
    }

    source = code;
    index = 0;
    lineNumber = (source.length > 0) ? 1 : 0;
    lineStart = 0;
    length = source.length;
    lookahead = null;
    state = {
        allowIn: true,
        labelSet: {},
        parenthesisCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1,
        yieldAllowed: false,
        curlyStack: [],
        curlyLastIndex: 0,
        inJSXSpreadAttribute: false,
        inJSXChild: false,
        inJSXTag: false
    };

    extra = {
        ecmaFeatures: defaultFeatures
    };

    // Options matching.
    options = options || {};

    // Of course we collect tokens here.
    options.tokens = true;
    extra.tokens = [];
    extra.tokenize = true;

    // The following two fields are necessary to compute the Regex tokens.
    extra.openParenToken = -1;
    extra.openCurlyToken = -1;

    extra.range = (typeof options.range === "boolean") && options.range;
    extra.loc = (typeof options.loc === "boolean") && options.loc;

    if (typeof options.comment === "boolean" && options.comment) {
        extra.comments = [];
    }
    if (typeof options.tolerant === "boolean" && options.tolerant) {
        extra.errors = [];
    }

    // apply parsing flags
    if (options.ecmaFeatures && typeof options.ecmaFeatures === "object") {
        extra.ecmaFeatures = options.ecmaFeatures;
    }

    try {
        peek();
        if (lookahead.type === Token.EOF) {
            return extra.tokens;
        }

        lex();
        while (lookahead.type !== Token.EOF) {
            try {
                lex();
            } catch (lexError) {
                if (extra.errors) {
                    extra.errors.push(lexError);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError;
                }
            }
        }

        filterTokenLocation();
        tokens = extra.tokens;

        if (typeof extra.comments !== "undefined") {
            tokens.comments = extra.comments;
        }
        if (typeof extra.errors !== "undefined") {
            tokens.errors = extra.errors;
        }
    } catch (e) {
        throw e;
    } finally {
        extra = {};
    }
    return tokens;
}

//------------------------------------------------------------------------------
// Parser
//------------------------------------------------------------------------------

function parse(code, options) {
    var program, toString;

    toString = String;
    if (typeof code !== "string" && !(code instanceof String)) {
        code = toString(code);
    }

    source = code;
    index = 0;
    lineNumber = (source.length > 0) ? 1 : 0;
    lineStart = 0;
    length = source.length;
    lookahead = null;
    state = {
        allowIn: true,
        labelSet: new StringMap(),
        parenthesisCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1,
        yieldAllowed: false,
        curlyStack: [],
        curlyLastIndex: 0,
        inJSXSpreadAttribute: false,
        inJSXChild: false,
        inJSXTag: false
    };

    extra = {
        ecmaFeatures: Object.create(defaultFeatures)
    };

    // for template strings
    state.curlyStack = [];

    if (typeof options !== "undefined") {
        extra.range = (typeof options.range === "boolean") && options.range;
        extra.loc = (typeof options.loc === "boolean") && options.loc;
        extra.attachComment = (typeof options.attachComment === "boolean") && options.attachComment;

        if (extra.loc && options.source !== null && options.source !== undefined) {
            extra.source = toString(options.source);
        }

        if (typeof options.tokens === "boolean" && options.tokens) {
            extra.tokens = [];
        }
        if (typeof options.comment === "boolean" && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === "boolean" && options.tolerant) {
            extra.errors = [];
        }
        if (extra.attachComment) {
            extra.range = true;
            extra.comments = [];
            commentAttachment.reset();
        }

        if (options.sourceType === "module") {
            extra.ecmaFeatures = {
                arrowFunctions: true,
                blockBindings: true,
                regexUFlag: true,
                regexYFlag: true,
                templateStrings: true,
                binaryLiterals: true,
                octalLiterals: true,
                unicodeCodePointEscapes: true,
                superInFunctions: true,
                defaultParams: true,
                restParams: true,
                forOf: true,
                objectLiteralComputedProperties: true,
                objectLiteralShorthandMethods: true,
                objectLiteralShorthandProperties: true,
                objectLiteralDuplicateProperties: true,
                generators: true,
                destructuring: true,
                classes: true,
                modules: true,
                newTarget: true
            };
        }

        // apply parsing flags after sourceType to allow overriding
        if (options.ecmaFeatures && typeof options.ecmaFeatures === "object") {

            // if it's a module, augment the ecmaFeatures
            if (options.sourceType === "module") {
                Object.keys(options.ecmaFeatures).forEach(function(key) {
                    extra.ecmaFeatures[key] = options.ecmaFeatures[key];
                });
            } else {
                extra.ecmaFeatures = options.ecmaFeatures;
            }
        }

    }

    try {
        program = parseProgram();
        if (typeof extra.comments !== "undefined") {
            program.comments = extra.comments;
        }
        if (typeof extra.tokens !== "undefined") {
            filterTokenLocation();
            program.tokens = extra.tokens;
        }
        if (typeof extra.errors !== "undefined") {
            program.errors = extra.errors;
        }
    } catch (e) {
        throw e;
    } finally {
        extra = {};
    }

    return program;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

exports.version = require("./package.json").version;

exports.tokenize = tokenize;

exports.parse = parse;

// Deep copy.
/* istanbul ignore next */
exports.Syntax = (function () {
    var name, types = {};

    if (typeof Object.create === "function") {
        types = Object.create(null);
    }

    for (name in astNodeTypes) {
        if (astNodeTypes.hasOwnProperty(name)) {
            types[name] = astNodeTypes[name];
        }
    }

    if (typeof Object.freeze === "function") {
        Object.freeze(types);
    }

    return types;
}());

},{"./lib/ast-node-factory":3,"./lib/ast-node-types":4,"./lib/comment-attachment":5,"./lib/features":6,"./lib/messages":7,"./lib/string-map":8,"./lib/syntax":9,"./lib/token-info":10,"./lib/xhtml-entities":11,"./package.json":12}],3:[function(require,module,exports){
/**
 * @fileoverview A factory for creating AST nodes
 * @author Fred K. Schott
 * @copyright 2014 Fred K. Schott. All rights reserved.
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var astNodeTypes = require("./ast-node-types");

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {

    /**
     * Create an Array Expression ASTNode out of an array of elements
     * @param {ASTNode[]} elements An array of ASTNode elements
     * @returns {ASTNode} An ASTNode representing the entire array expression
     */
    createArrayExpression: function(elements) {
        return {
            type: astNodeTypes.ArrayExpression,
            elements: elements
        };
    },

    /**
     * Create an Arrow Function Expression ASTNode
     * @param {ASTNode} params The function arguments
     * @param {ASTNode} body The function body
     * @param {boolean} expression True if the arrow function is created via an expression.
     *      Always false for declarations, but kept here to be in sync with
     *      FunctionExpression objects.
     * @returns {ASTNode} An ASTNode representing the entire arrow function expression
     */
    createArrowFunctionExpression: function (params, body, expression) {
        return {
            type: astNodeTypes.ArrowFunctionExpression,
            id: null,
            params: params,
            body: body,
            generator: false,
            expression: expression
        };
    },

    /**
     * Create an ASTNode representation of an assignment expression
     * @param {ASTNode} operator The assignment operator
     * @param {ASTNode} left The left operand
     * @param {ASTNode} right The right operand
     * @returns {ASTNode} An ASTNode representing the entire assignment expression
     */
    createAssignmentExpression: function(operator, left, right) {
        return {
            type: astNodeTypes.AssignmentExpression,
            operator: operator,
            left: left,
            right: right
        };
    },

    /**
     * Create an ASTNode representation of an assignment pattern (default parameters)
     * @param {ASTNode} left The left operand
     * @param {ASTNode} right The right operand
     * @returns {ASTNode} An ASTNode representing the entire assignment pattern
     */
    createAssignmentPattern: function(left, right) {
        return {
            type: astNodeTypes.AssignmentPattern,
            left: left,
            right: right
        };
    },

    /**
     * Create an ASTNode representation of a binary expression
     * @param {ASTNode} operator The assignment operator
     * @param {ASTNode} left The left operand
     * @param {ASTNode} right The right operand
     * @returns {ASTNode} An ASTNode representing the entire binary expression
     */
    createBinaryExpression: function(operator, left, right) {
        var type = (operator === "||" || operator === "&&") ? astNodeTypes.LogicalExpression :
                    astNodeTypes.BinaryExpression;
        return {
            type: type,
            operator: operator,
            left: left,
            right: right
        };
    },

    /**
     * Create an ASTNode representation of a block statement
     * @param {ASTNode} body The block statement body
     * @returns {ASTNode} An ASTNode representing the entire block statement
     */
    createBlockStatement: function(body) {
        return {
            type: astNodeTypes.BlockStatement,
            body: body
        };
    },

    /**
     * Create an ASTNode representation of a break statement
     * @param {ASTNode} label The break statement label
     * @returns {ASTNode} An ASTNode representing the break statement
     */
    createBreakStatement: function(label) {
        return {
            type: astNodeTypes.BreakStatement,
            label: label
        };
    },

    /**
     * Create an ASTNode representation of a call expression
     * @param {ASTNode} callee The function being called
     * @param {ASTNode[]} args An array of ASTNodes representing the function call arguments
     * @returns {ASTNode} An ASTNode representing the entire call expression
     */
    createCallExpression: function(callee, args) {
        return {
            type: astNodeTypes.CallExpression,
            callee: callee,
            "arguments": args
        };
    },

    /**
     * Create an ASTNode representation of a catch clause/block
     * @param {ASTNode} param Any catch clause exeption/conditional parameter information
     * @param {ASTNode} body The catch block body
     * @returns {ASTNode} An ASTNode representing the entire catch clause
     */
    createCatchClause: function(param, body) {
        return {
            type: astNodeTypes.CatchClause,
            param: param,
            body: body
        };
    },

    /**
     * Creates an ASTNode representation of a class body.
     * @param {ASTNode} body The node representing the body of the class.
     * @returns {ASTNode} An ASTNode representing the class body.
     */
    createClassBody: function(body) {
        return {
            type: astNodeTypes.ClassBody,
            body: body
        };
    },

    createClassExpression: function(id, superClass, body) {
        return {
            type: astNodeTypes.ClassExpression,
            id: id,
            superClass: superClass,
            body: body
        };
    },

    createClassDeclaration: function(id, superClass, body) {
        return {
            type: astNodeTypes.ClassDeclaration,
            id: id,
            superClass: superClass,
            body: body
        };
    },

    createMethodDefinition: function(propertyType, kind, key, value, computed) {
        return {
            type: astNodeTypes.MethodDefinition,
            key: key,
            value: value,
            kind: kind,
            "static": propertyType === "static",
            computed: computed
        };
    },

    createMetaProperty: function(meta, property) {
        return {
            type: astNodeTypes.MetaProperty,
            meta: meta,
            property: property
        };
    },

    /**
     * Create an ASTNode representation of a conditional expression
     * @param {ASTNode} test The conditional to evaluate
     * @param {ASTNode} consequent The code to be run if the test returns true
     * @param {ASTNode} alternate The code to be run if the test returns false
     * @returns {ASTNode} An ASTNode representing the entire conditional expression
     */
    createConditionalExpression: function(test, consequent, alternate) {
        return {
            type: astNodeTypes.ConditionalExpression,
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    },

    /**
     * Create an ASTNode representation of a continue statement
     * @param {?ASTNode} label The optional continue label (null if not set)
     * @returns {ASTNode} An ASTNode representing the continue statement
     */
    createContinueStatement: function(label) {
        return {
            type: astNodeTypes.ContinueStatement,
            label: label
        };
    },

    /**
     * Create an ASTNode representation of a debugger statement
     * @returns {ASTNode} An ASTNode representing the debugger statement
     */
    createDebuggerStatement: function() {
        return {
            type: astNodeTypes.DebuggerStatement
        };
    },

    /**
     * Create an ASTNode representation of an empty statement
     * @returns {ASTNode} An ASTNode representing an empty statement
     */
    createEmptyStatement: function() {
        return {
            type: astNodeTypes.EmptyStatement
        };
    },

    /**
     * Create an ASTNode representation of an expression statement
     * @param {ASTNode} expression The expression
     * @returns {ASTNode} An ASTNode representing an expression statement
     */
    createExpressionStatement: function(expression) {
        return {
            type: astNodeTypes.ExpressionStatement,
            expression: expression
        };
    },

    /**
     * Create an ASTNode representation of a while statement
     * @param {ASTNode} test The while conditional
     * @param {ASTNode} body The while loop body
     * @returns {ASTNode} An ASTNode representing a while statement
     */
    createWhileStatement: function(test, body) {
        return {
            type: astNodeTypes.WhileStatement,
            test: test,
            body: body
        };
    },

    /**
     * Create an ASTNode representation of a do..while statement
     * @param {ASTNode} test The do..while conditional
     * @param {ASTNode} body The do..while loop body
     * @returns {ASTNode} An ASTNode representing a do..while statement
     */
    createDoWhileStatement: function(test, body) {
        return {
            type: astNodeTypes.DoWhileStatement,
            body: body,
            test: test
        };
    },

    /**
     * Create an ASTNode representation of a for statement
     * @param {ASTNode} init The initialization expression
     * @param {ASTNode} test The conditional test expression
     * @param {ASTNode} update The update expression
     * @param {ASTNode} body The statement body
     * @returns {ASTNode} An ASTNode representing a for statement
     */
    createForStatement: function(init, test, update, body) {
        return {
            type: astNodeTypes.ForStatement,
            init: init,
            test: test,
            update: update,
            body: body
        };
    },

    /**
     * Create an ASTNode representation of a for..in statement
     * @param {ASTNode} left The left-side variable for the property name
     * @param {ASTNode} right The right-side object
     * @param {ASTNode} body The statement body
     * @returns {ASTNode} An ASTNode representing a for..in statement
     */
    createForInStatement: function(left, right, body) {
        return {
            type: astNodeTypes.ForInStatement,
            left: left,
            right: right,
            body: body,
            each: false
        };
    },

    /**
     * Create an ASTNode representation of a for..of statement
     * @param {ASTNode} left The left-side variable for the property value
     * @param {ASTNode} right The right-side object
     * @param {ASTNode} body The statement body
     * @returns {ASTNode} An ASTNode representing a for..of statement
     */
    createForOfStatement: function(left, right, body) {
        return {
            type: astNodeTypes.ForOfStatement,
            left: left,
            right: right,
            body: body
        };
    },

    /**
     * Create an ASTNode representation of a function declaration
     * @param {ASTNode} id The function name
     * @param {ASTNode} params The function arguments
     * @param {ASTNode} body The function body
     * @param {boolean} generator True if the function is a generator, false if not.
     * @param {boolean} expression True if the function is created via an expression.
     *      Always false for declarations, but kept here to be in sync with
     *      FunctionExpression objects.
     * @returns {ASTNode} An ASTNode representing a function declaration
     */
    createFunctionDeclaration: function (id, params, body, generator, expression) {
        return {
            type: astNodeTypes.FunctionDeclaration,
            id: id,
            params: params || [],
            body: body,
            generator: !!generator,
            expression: !!expression
        };
    },

    /**
     * Create an ASTNode representation of a function expression
     * @param {ASTNode} id The function name
     * @param {ASTNode} params The function arguments
     * @param {ASTNode} body The function body
     * @param {boolean} generator True if the function is a generator, false if not.
     * @param {boolean} expression True if the function is created via an expression.
     * @returns {ASTNode} An ASTNode representing a function declaration
     */
    createFunctionExpression: function (id, params, body, generator, expression) {
        return {
            type: astNodeTypes.FunctionExpression,
            id: id,
            params: params || [],
            body: body,
            generator: !!generator,
            expression: !!expression
        };
    },

    /**
     * Create an ASTNode representation of an identifier
     * @param {ASTNode} name The identifier name
     * @returns {ASTNode} An ASTNode representing an identifier
     */
    createIdentifier: function(name) {
        return {
            type: astNodeTypes.Identifier,
            name: name
        };
    },

    /**
     * Create an ASTNode representation of an if statement
     * @param {ASTNode} test The if conditional expression
     * @param {ASTNode} consequent The consequent if statement to run
     * @param {ASTNode} alternate the "else" alternate statement
     * @returns {ASTNode} An ASTNode representing an if statement
     */
    createIfStatement: function(test, consequent, alternate) {
        return {
            type: astNodeTypes.IfStatement,
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    },

    /**
     * Create an ASTNode representation of a labeled statement
     * @param {ASTNode} label The statement label
     * @param {ASTNode} body The labeled statement body
     * @returns {ASTNode} An ASTNode representing a labeled statement
     */
    createLabeledStatement: function(label, body) {
        return {
            type: astNodeTypes.LabeledStatement,
            label: label,
            body: body
        };
    },

    /**
     * Create an ASTNode literal from the source code
     * @param {ASTNode} token The ASTNode token
     * @param {string} source The source code to get the literal from
     * @returns {ASTNode} An ASTNode representing the new literal
     */
    createLiteralFromSource: function(token, source) {
        var node = {
            type: astNodeTypes.Literal,
            value: token.value,
            raw: source.slice(token.range[0], token.range[1])
        };

        // regular expressions have regex properties
        if (token.regex) {
            node.regex = token.regex;
        }

        return node;
    },

    /**
     * Create an ASTNode template element
     * @param {Object} value Data on the element value
     * @param {string} value.raw The raw template string
     * @param {string} value.cooked The processed template string
     * @param {boolean} tail True if this is the final element in a template string
     * @returns {ASTNode} An ASTNode representing the template string element
     */
    createTemplateElement: function(value, tail) {
        return {
            type: astNodeTypes.TemplateElement,
            value: value,
            tail: tail
        };
    },

    /**
     * Create an ASTNode template literal
     * @param {ASTNode[]} quasis An array of the template string elements
     * @param {ASTNode[]} expressions An array of the template string expressions
     * @returns {ASTNode} An ASTNode representing the template string
     */
    createTemplateLiteral: function(quasis, expressions) {
        return {
            type: astNodeTypes.TemplateLiteral,
            quasis: quasis,
            expressions: expressions
        };
    },

    /**
     * Create an ASTNode representation of a spread element
     * @param {ASTNode} argument The array being spread
     * @returns {ASTNode} An ASTNode representing a spread element
     */
    createSpreadElement: function(argument) {
        return {
            type: astNodeTypes.SpreadElement,
            argument: argument
        };
    },

    /**
     * Create an ASTNode representation of an experimental rest property
     * @param {ASTNode} argument The identifier being rested
     * @returns {ASTNode} An ASTNode representing a rest element
     */
    createExperimentalRestProperty: function(argument) {
        return {
            type: astNodeTypes.ExperimentalRestProperty,
            argument: argument
        };
    },

    /**
     * Create an ASTNode representation of an experimental spread property
     * @param {ASTNode} argument The identifier being spread
     * @returns {ASTNode} An ASTNode representing a spread element
     */
    createExperimentalSpreadProperty: function(argument) {
        return {
            type: astNodeTypes.ExperimentalSpreadProperty,
            argument: argument
        };
    },

    /**
     * Create an ASTNode tagged template expression
     * @param {ASTNode} tag The tag expression
     * @param {ASTNode} quasi A TemplateLiteral ASTNode representing
     * the template string itself.
     * @returns {ASTNode} An ASTNode representing the tagged template
     */
    createTaggedTemplateExpression: function(tag, quasi) {
        return {
            type: astNodeTypes.TaggedTemplateExpression,
            tag: tag,
            quasi: quasi
        };
    },

    /**
     * Create an ASTNode representation of a member expression
     * @param {string} accessor The member access method (bracket or period)
     * @param {ASTNode} object The object being referenced
     * @param {ASTNode} property The object-property being referenced
     * @returns {ASTNode} An ASTNode representing a member expression
     */
    createMemberExpression: function(accessor, object, property) {
        return {
            type: astNodeTypes.MemberExpression,
            computed: accessor === "[",
            object: object,
            property: property
        };
    },

    /**
     * Create an ASTNode representation of a new expression
     * @param {ASTNode} callee The constructor for the new object type
     * @param {ASTNode} args The arguments passed to the constructor
     * @returns {ASTNode} An ASTNode representing a new expression
     */
    createNewExpression: function(callee, args) {
        return {
            type: astNodeTypes.NewExpression,
            callee: callee,
            "arguments": args
        };
    },

    /**
     * Create an ASTNode representation of a new object expression
     * @param {ASTNode[]} properties An array of ASTNodes that represent all object
     *      properties and associated values
     * @returns {ASTNode} An ASTNode representing a new object expression
     */
    createObjectExpression: function(properties) {
        return {
            type: astNodeTypes.ObjectExpression,
            properties: properties
        };
    },

    /**
     * Create an ASTNode representation of a postfix expression
     * @param {string} operator The postfix operator ("++", "--", etc.)
     * @param {ASTNode} argument The operator argument
     * @returns {ASTNode} An ASTNode representing a postfix expression
     */
    createPostfixExpression: function(operator, argument) {
        return {
            type: astNodeTypes.UpdateExpression,
            operator: operator,
            argument: argument,
            prefix: false
        };
    },

    /**
     * Create an ASTNode representation of an entire program
     * @param {ASTNode} body The program body
     * @param {string} sourceType Either "module" or "script".
     * @returns {ASTNode} An ASTNode representing an entire program
     */
    createProgram: function(body, sourceType) {
        return {
            type: astNodeTypes.Program,
            body: body,
            sourceType: sourceType
        };
    },

    /**
     * Create an ASTNode representation of an object property
     * @param {string} kind The type of property represented ("get", "set", etc.)
     * @param {ASTNode} key The property key
     * @param {ASTNode} value The new property value
     * @param {boolean} method True if the property is also a method (value is a function)
     * @param {boolean} shorthand True if the property is shorthand
     * @param {boolean} computed True if the property value has been computed
     * @returns {ASTNode} An ASTNode representing an object property
     */
    createProperty: function(kind, key, value, method, shorthand, computed) {
        return {
            type: astNodeTypes.Property,
            key: key,
            value: value,
            kind: kind,
            method: method,
            shorthand: shorthand,
            computed: computed
        };
    },

    /**
     * Create an ASTNode representation of a rest element
     * @param {ASTNode} argument The rest argument
     * @returns {ASTNode} An ASTNode representing a rest element
     */
    createRestElement: function (argument) {
        return {
            type: astNodeTypes.RestElement,
            argument: argument
        };
    },

    /**
     * Create an ASTNode representation of a return statement
     * @param {?ASTNode} argument The return argument, null if no argument is provided
     * @returns {ASTNode} An ASTNode representing a return statement
     */
    createReturnStatement: function(argument) {
        return {
            type: astNodeTypes.ReturnStatement,
            argument: argument
        };
    },

    /**
     * Create an ASTNode representation of a sequence of expressions
     * @param {ASTNode[]} expressions An array containing each expression, in order
     * @returns {ASTNode} An ASTNode representing a sequence of expressions
     */
    createSequenceExpression: function(expressions) {
        return {
            type: astNodeTypes.SequenceExpression,
            expressions: expressions
        };
    },

    /**
     * Create an ASTNode representation of super
     * @returns {ASTNode} An ASTNode representing super
     */
    createSuper: function() {
        return {
            type: astNodeTypes.Super
        };
    },

    /**
     * Create an ASTNode representation of a switch case statement
     * @param {ASTNode} test The case value to test against the switch value
     * @param {ASTNode} consequent The consequent case statement
     * @returns {ASTNode} An ASTNode representing a switch case
     */
    createSwitchCase: function(test, consequent) {
        return {
            type: astNodeTypes.SwitchCase,
            test: test,
            consequent: consequent
        };
    },

    /**
     * Create an ASTNode representation of a switch statement
     * @param {ASTNode} discriminant An expression to test against each case value
     * @param {ASTNode[]} cases An array of switch case statements
     * @returns {ASTNode} An ASTNode representing a switch statement
     */
    createSwitchStatement: function(discriminant, cases) {
        return {
            type: astNodeTypes.SwitchStatement,
            discriminant: discriminant,
            cases: cases
        };
    },

    /**
     * Create an ASTNode representation of a this statement
     * @returns {ASTNode} An ASTNode representing a this statement
     */
    createThisExpression: function() {
        return {
            type: astNodeTypes.ThisExpression
        };
    },

    /**
     * Create an ASTNode representation of a throw statement
     * @param {ASTNode} argument The argument to throw
     * @returns {ASTNode} An ASTNode representing a throw statement
     */
    createThrowStatement: function(argument) {
        return {
            type: astNodeTypes.ThrowStatement,
            argument: argument
        };
    },

    /**
     * Create an ASTNode representation of a try statement
     * @param {ASTNode} block The try block
     * @param {ASTNode} handler A catch handler
     * @param {?ASTNode} finalizer The final code block to run after the try/catch has run
     * @returns {ASTNode} An ASTNode representing a try statement
     */
    createTryStatement: function(block, handler, finalizer) {
        return {
            type: astNodeTypes.TryStatement,
            block: block,
            handler: handler,
            finalizer: finalizer
        };
    },

    /**
     * Create an ASTNode representation of a unary expression
     * @param {string} operator The unary operator
     * @param {ASTNode} argument The unary operand
     * @returns {ASTNode} An ASTNode representing a unary expression
     */
    createUnaryExpression: function(operator, argument) {
        if (operator === "++" || operator === "--") {
            return {
                type: astNodeTypes.UpdateExpression,
                operator: operator,
                argument: argument,
                prefix: true
            };
        }
        return {
            type: astNodeTypes.UnaryExpression,
            operator: operator,
            argument: argument,
            prefix: true
        };
    },

    /**
     * Create an ASTNode representation of a variable declaration
     * @param {ASTNode[]} declarations An array of variable declarations
     * @param {string} kind The kind of variable created ("var", "let", etc.)
     * @returns {ASTNode} An ASTNode representing a variable declaration
     */
    createVariableDeclaration: function(declarations, kind) {
        return {
            type: astNodeTypes.VariableDeclaration,
            declarations: declarations,
            kind: kind
        };
    },

    /**
     * Create an ASTNode representation of a variable declarator
     * @param {ASTNode} id The variable ID
     * @param {ASTNode} init The variable's initial value
     * @returns {ASTNode} An ASTNode representing a variable declarator
     */
    createVariableDeclarator: function(id, init) {
        return {
            type: astNodeTypes.VariableDeclarator,
            id: id,
            init: init
        };
    },

    /**
     * Create an ASTNode representation of a with statement
     * @param {ASTNode} object The with statement object expression
     * @param {ASTNode} body The with statement body
     * @returns {ASTNode} An ASTNode representing a with statement
     */
    createWithStatement: function(object, body) {
        return {
            type: astNodeTypes.WithStatement,
            object: object,
            body: body
        };
    },

    createYieldExpression: function(argument, delegate) {
        return {
            type: astNodeTypes.YieldExpression,
            argument: argument || null,
            delegate: delegate
        };
    },

    createJSXAttribute: function(name, value) {
        return {
            type: astNodeTypes.JSXAttribute,
            name: name,
            value: value || null
        };
    },

    createJSXSpreadAttribute: function(argument) {
        return {
            type: astNodeTypes.JSXSpreadAttribute,
            argument: argument
        };
    },

    createJSXIdentifier: function(name) {
        return {
            type: astNodeTypes.JSXIdentifier,
            name: name
        };
    },

    createJSXNamespacedName: function(namespace, name) {
        return {
            type: astNodeTypes.JSXNamespacedName,
            namespace: namespace,
            name: name
        };
    },

    createJSXMemberExpression: function(object, property) {
        return {
            type: astNodeTypes.JSXMemberExpression,
            object: object,
            property: property
        };
    },

    createJSXElement: function(openingElement, closingElement, children) {
        return {
            type: astNodeTypes.JSXElement,
            openingElement: openingElement,
            closingElement: closingElement,
            children: children
        };
    },

    createJSXEmptyExpression: function() {
        return {
            type: astNodeTypes.JSXEmptyExpression
        };
    },

    createJSXExpressionContainer: function(expression) {
        return {
            type: astNodeTypes.JSXExpressionContainer,
            expression: expression
        };
    },

    createJSXOpeningElement: function(name, attributes, selfClosing) {
        return {
            type: astNodeTypes.JSXOpeningElement,
            name: name,
            selfClosing: selfClosing,
            attributes: attributes
        };
    },

    createJSXClosingElement: function(name) {
        return {
            type: astNodeTypes.JSXClosingElement,
            name: name
        };
    },

    createExportSpecifier: function(local, exported) {
        return {
            type: astNodeTypes.ExportSpecifier,
            exported: exported || local,
            local: local
        };
    },

    createImportDefaultSpecifier: function(local) {
        return {
            type: astNodeTypes.ImportDefaultSpecifier,
            local: local
        };
    },

    createImportNamespaceSpecifier: function(local) {
        return {
            type: astNodeTypes.ImportNamespaceSpecifier,
            local: local
        };
    },

    createExportNamedDeclaration: function(declaration, specifiers, source) {
        return {
            type: astNodeTypes.ExportNamedDeclaration,
            declaration: declaration,
            specifiers: specifiers,
            source: source
        };
    },

    createExportDefaultDeclaration: function(declaration) {
        return {
            type: astNodeTypes.ExportDefaultDeclaration,
            declaration: declaration
        };
    },

    createExportAllDeclaration: function(source) {
        return {
            type: astNodeTypes.ExportAllDeclaration,
            source: source
        };
    },

    createImportSpecifier: function(local, imported) {
        return {
            type: astNodeTypes.ImportSpecifier,
            local: local || imported,
            imported: imported
        };
    },

    createImportDeclaration: function(specifiers, source) {
        return {
            type: astNodeTypes.ImportDeclaration,
            specifiers: specifiers,
            source: source
        };
    }

};

},{"./ast-node-types":4}],4:[function(require,module,exports){
/**
 * @fileoverview The AST node types produced by the parser.
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {
    AssignmentExpression: "AssignmentExpression",
    AssignmentPattern: "AssignmentPattern",
    ArrayExpression: "ArrayExpression",
    ArrayPattern: "ArrayPattern",
    ArrowFunctionExpression: "ArrowFunctionExpression",
    BlockStatement: "BlockStatement",
    BinaryExpression: "BinaryExpression",
    BreakStatement: "BreakStatement",
    CallExpression: "CallExpression",
    CatchClause: "CatchClause",
    ClassBody: "ClassBody",
    ClassDeclaration: "ClassDeclaration",
    ClassExpression: "ClassExpression",
    ConditionalExpression: "ConditionalExpression",
    ContinueStatement: "ContinueStatement",
    DoWhileStatement: "DoWhileStatement",
    DebuggerStatement: "DebuggerStatement",
    EmptyStatement: "EmptyStatement",
    ExperimentalRestProperty: "ExperimentalRestProperty",
    ExperimentalSpreadProperty: "ExperimentalSpreadProperty",
    ExpressionStatement: "ExpressionStatement",
    ForStatement: "ForStatement",
    ForInStatement: "ForInStatement",
    ForOfStatement: "ForOfStatement",
    FunctionDeclaration: "FunctionDeclaration",
    FunctionExpression: "FunctionExpression",
    Identifier: "Identifier",
    IfStatement: "IfStatement",
    Literal: "Literal",
    LabeledStatement: "LabeledStatement",
    LogicalExpression: "LogicalExpression",
    MemberExpression: "MemberExpression",
    MetaProperty: "MetaProperty",
    MethodDefinition: "MethodDefinition",
    NewExpression: "NewExpression",
    ObjectExpression: "ObjectExpression",
    ObjectPattern: "ObjectPattern",
    Program: "Program",
    Property: "Property",
    RestElement: "RestElement",
    ReturnStatement: "ReturnStatement",
    SequenceExpression: "SequenceExpression",
    SpreadElement: "SpreadElement",
    Super: "Super",
    SwitchCase: "SwitchCase",
    SwitchStatement: "SwitchStatement",
    TaggedTemplateExpression: "TaggedTemplateExpression",
    TemplateElement: "TemplateElement",
    TemplateLiteral: "TemplateLiteral",
    ThisExpression: "ThisExpression",
    ThrowStatement: "ThrowStatement",
    TryStatement: "TryStatement",
    UnaryExpression: "UnaryExpression",
    UpdateExpression: "UpdateExpression",
    VariableDeclaration: "VariableDeclaration",
    VariableDeclarator: "VariableDeclarator",
    WhileStatement: "WhileStatement",
    WithStatement: "WithStatement",
    YieldExpression: "YieldExpression",
    JSXIdentifier: "JSXIdentifier",
    JSXNamespacedName: "JSXNamespacedName",
    JSXMemberExpression: "JSXMemberExpression",
    JSXEmptyExpression: "JSXEmptyExpression",
    JSXExpressionContainer: "JSXExpressionContainer",
    JSXElement: "JSXElement",
    JSXClosingElement: "JSXClosingElement",
    JSXOpeningElement: "JSXOpeningElement",
    JSXAttribute: "JSXAttribute",
    JSXSpreadAttribute: "JSXSpreadAttribute",
    JSXText: "JSXText",
    ExportDefaultDeclaration: "ExportDefaultDeclaration",
    ExportNamedDeclaration: "ExportNamedDeclaration",
    ExportAllDeclaration: "ExportAllDeclaration",
    ExportSpecifier: "ExportSpecifier",
    ImportDeclaration: "ImportDeclaration",
    ImportSpecifier: "ImportSpecifier",
    ImportDefaultSpecifier: "ImportDefaultSpecifier",
    ImportNamespaceSpecifier: "ImportNamespaceSpecifier"
};

},{}],5:[function(require,module,exports){
/**
 * @fileoverview Attaches comments to the AST.
 * @author Nicholas C. Zakas
 * @copyright 2015 Nicholas C. Zakas. All rights reserved.
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var astNodeTypes = require("./ast-node-types");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var extra = {
        trailingComments: [],
        leadingComments: [],
        bottomRightStack: []
    };

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {

    reset: function() {
        extra.trailingComments = [];
        extra.leadingComments = [];
        extra.bottomRightStack = [];
    },

    addComment: function(comment) {
        extra.trailingComments.push(comment);
        extra.leadingComments.push(comment);
    },

    processComment: function(node) {
        var lastChild,
            trailingComments,
            i;

        if (node.type === astNodeTypes.Program) {
            if (node.body.length > 0) {
                return;
            }
        }

        if (extra.trailingComments.length > 0) {

            /*
             * If the first comment in trailingComments comes after the
             * current node, then we're good - all comments in the array will
             * come after the node and so it's safe to add then as official
             * trailingComments.
             */
            if (extra.trailingComments[0].range[0] >= node.range[1]) {
                trailingComments = extra.trailingComments;
                extra.trailingComments = [];
            } else {

                /*
                 * Otherwise, if the first comment doesn't come after the
                 * current node, that means we have a mix of leading and trailing
                 * comments in the array and that leadingComments contains the
                 * same items as trailingComments. Reset trailingComments to
                 * zero items and we'll handle this by evaluating leadingComments
                 * later.
                 */
                extra.trailingComments.length = 0;
            }
        } else {
            if (extra.bottomRightStack.length > 0 &&
                    extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments &&
                    extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments[0].range[0] >= node.range[1]) {
                trailingComments = extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments;
                delete extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments;
            }
        }

        // Eating the stack.
        while (extra.bottomRightStack.length > 0 && extra.bottomRightStack[extra.bottomRightStack.length - 1].range[0] >= node.range[0]) {
            lastChild = extra.bottomRightStack.pop();
        }

        if (lastChild) {
            if (lastChild.leadingComments) {
                if (lastChild.leadingComments[lastChild.leadingComments.length - 1].range[1] <= node.range[0]) {
                    node.leadingComments = lastChild.leadingComments;
                    delete lastChild.leadingComments;
                } else {
                    // A leading comment for an anonymous class had been stolen by its first MethodDefinition,
                    // so this takes back the leading comment.
                    // See Also: https://github.com/eslint/espree/issues/158
                    for (i = lastChild.leadingComments.length - 2; i >= 0; --i) {
                        if (lastChild.leadingComments[i].range[1] <= node.range[0]) {
                            node.leadingComments = lastChild.leadingComments.splice(0, i + 1);
                            break;
                        }
                    }
                }
            }
        } else if (extra.leadingComments.length > 0) {

            if (extra.leadingComments[extra.leadingComments.length - 1].range[1] <= node.range[0]) {
                node.leadingComments = extra.leadingComments;
                extra.leadingComments = [];
            } else {

                // https://github.com/eslint/espree/issues/2

                /*
                 * In special cases, such as return (without a value) and
                 * debugger, all comments will end up as leadingComments and
                 * will otherwise be eliminated. This extra step runs when the
                 * bottomRightStack is empty and there are comments left
                 * in leadingComments.
                 *
                 * This loop figures out the stopping point between the actual
                 * leading and trailing comments by finding the location of the
                 * first comment that comes after the given node.
                 */
                for (i = 0; i < extra.leadingComments.length; i++) {
                    if (extra.leadingComments[i].range[1] > node.range[0]) {
                        break;
                    }
                }

                /*
                 * Split the array based on the location of the first comment
                 * that comes after the node. Keep in mind that this could
                 * result in an empty array, and if so, the array must be
                 * deleted.
                 */
                node.leadingComments = extra.leadingComments.slice(0, i);
                if (node.leadingComments.length === 0) {
                    delete node.leadingComments;
                }

                /*
                 * Similarly, trailing comments are attached later. The variable
                 * must be reset to null if there are no trailing comments.
                 */
                trailingComments = extra.leadingComments.slice(i);
                if (trailingComments.length === 0) {
                    trailingComments = null;
                }
            }
        }

        if (trailingComments) {
            node.trailingComments = trailingComments;
        }

        extra.bottomRightStack.push(node);
    }

};

},{"./ast-node-types":4}],6:[function(require,module,exports){
/**
 * @fileoverview The list of feature flags supported by the parser and their default
 *      settings.
 * @author Nicholas C. Zakas
 * @copyright 2015 Fred K. Schott. All rights reserved.
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {

    // enable parsing of arrow functions
    arrowFunctions: false,

    // enable parsing of let and const
    blockBindings: true,

    // enable parsing of destructured arrays and objects
    destructuring: false,

    // enable parsing of regex u flag
    regexUFlag: false,

    // enable parsing of regex y flag
    regexYFlag: false,

    // enable parsing of template strings
    templateStrings: false,

    // enable parsing binary literals
    binaryLiterals: false,

    // enable parsing ES6 octal literals
    octalLiterals: false,

    // enable parsing unicode code point escape sequences
    unicodeCodePointEscapes: true,

    // enable parsing of default parameters
    defaultParams: false,

    // enable parsing of rest parameters
    restParams: false,

    // enable parsing of for-of statements
    forOf: false,

    // enable parsing computed object literal properties
    objectLiteralComputedProperties: false,

    // enable parsing of shorthand object literal methods
    objectLiteralShorthandMethods: false,

    // enable parsing of shorthand object literal properties
    objectLiteralShorthandProperties: false,

    // Allow duplicate object literal properties (except '__proto__')
    objectLiteralDuplicateProperties: false,

    // enable parsing of generators/yield
    generators: false,

    // support the spread operator
    spread: false,

    // enable super in functions
    superInFunctions: false,

    // enable parsing of classes
    classes: false,

    // enable parsing of new.target
    newTarget: false,

    // enable parsing of modules
    modules: false,

    // React JSX parsing
    jsx: false,

    // allow return statement in global scope
    globalReturn: false,

    // allow experimental object rest/spread
    experimentalObjectRestSpread: false
};

},{}],7:[function(require,module,exports){
/**
 * @fileoverview Error messages returned by the parser.
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

// error messages should be identical to V8 where possible
module.exports = {
    UnexpectedToken: "Unexpected token %0",
    UnexpectedNumber: "Unexpected number",
    UnexpectedString: "Unexpected string",
    UnexpectedIdentifier: "Unexpected identifier",
    UnexpectedReserved: "Unexpected reserved word",
    UnexpectedTemplate: "Unexpected quasi %0",
    UnexpectedEOS: "Unexpected end of input",
    NewlineAfterThrow: "Illegal newline after throw",
    InvalidRegExp: "Invalid regular expression",
    InvalidRegExpFlag: "Invalid regular expression flag",
    UnterminatedRegExp: "Invalid regular expression: missing /",
    InvalidLHSInAssignment: "Invalid left-hand side in assignment",
    InvalidLHSInFormalsList: "Invalid left-hand side in formals list",
    InvalidLHSInForIn: "Invalid left-hand side in for-in",
    MultipleDefaultsInSwitch: "More than one default clause in switch statement",
    NoCatchOrFinally: "Missing catch or finally after try",
    NoUnintializedConst: "Const must be initialized",
    UnknownLabel: "Undefined label '%0'",
    Redeclaration: "%0 '%1' has already been declared",
    IllegalContinue: "Illegal continue statement",
    IllegalBreak: "Illegal break statement",
    IllegalReturn: "Illegal return statement",
    IllegalYield: "Illegal yield expression",
    IllegalSpread: "Illegal spread element",
    StrictModeWith: "Strict mode code may not include a with statement",
    StrictCatchVariable: "Catch variable may not be eval or arguments in strict mode",
    StrictVarName: "Variable name may not be eval or arguments in strict mode",
    StrictParamName: "Parameter name eval or arguments is not allowed in strict mode",
    StrictParamDupe: "Strict mode function may not have duplicate parameter names",
    TemplateOctalLiteral: "Octal literals are not allowed in template strings.",
    ParameterAfterRestParameter: "Rest parameter must be last formal parameter",
    DefaultRestParameter: "Rest parameter can not have a default value",
    ElementAfterSpreadElement: "Spread must be the final element of an element list",
    ObjectPatternAsRestParameter: "Invalid rest parameter",
    ObjectPatternAsSpread: "Invalid spread argument",
    StrictFunctionName: "Function name may not be eval or arguments in strict mode",
    StrictOctalLiteral: "Octal literals are not allowed in strict mode.",
    StrictDelete: "Delete of an unqualified identifier in strict mode.",
    StrictDuplicateProperty: "Duplicate data property in object literal not allowed in strict mode",
    DuplicatePrototypeProperty: "Duplicate '__proto__' property in object literal are not allowed",
    ConstructorSpecialMethod: "Class constructor may not be an accessor",
    DuplicateConstructor: "A class may only have one constructor",
    StaticPrototype: "Classes may not have static property named prototype",
    AccessorDataProperty: "Object literal may not have data and accessor property with the same name",
    AccessorGetSet: "Object literal may not have multiple get/set accessors with the same name",
    StrictLHSAssignment: "Assignment to eval or arguments is not allowed in strict mode",
    StrictLHSPostfix: "Postfix increment/decrement may not have eval or arguments operand in strict mode",
    StrictLHSPrefix: "Prefix increment/decrement may not have eval or arguments operand in strict mode",
    StrictReservedWord: "Use of future reserved word in strict mode",
    InvalidJSXAttributeValue: "JSX value should be either an expression or a quoted JSX text",
    ExpectedJSXClosingTag: "Expected corresponding JSX closing tag for %0",
    AdjacentJSXElements: "Adjacent JSX elements must be wrapped in an enclosing tag",
    MissingFromClause: "Missing from clause",
    NoAsAfterImportNamespace: "Missing as after import *",
    InvalidModuleSpecifier: "Invalid module specifier",
    IllegalImportDeclaration: "Illegal import declaration",
    IllegalExportDeclaration: "Illegal export declaration"
};

},{}],8:[function(require,module,exports){
/**
 * @fileoverview A simple map that helps avoid collisions on the Object prototype.
 * @author Jamund Ferguson
 * @copyright 2015 Jamund Ferguson. All rights reserved.
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

function StringMap() {
    this.$data = {};
}

StringMap.prototype.get = function (key) {
    key = "$" + key;
    return this.$data[key];
};

StringMap.prototype.set = function (key, value) {
    key = "$" + key;
    this.$data[key] = value;
    return this;
};

StringMap.prototype.has = function (key) {
    key = "$" + key;
    return Object.prototype.hasOwnProperty.call(this.$data, key);
};

StringMap.prototype.delete = function (key) {
    key = "$" + key;
    return delete this.$data[key];
};

module.exports = StringMap;

},{}],9:[function(require,module,exports){
/**
 * @fileoverview Various syntax/pattern checks for parsing.
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 * @copyright 2012-2013 Mathias Bynens <mathias@qiwi.be>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

// See also tools/generate-identifier-regex.js.
var Regex = {
    NonAsciiIdentifierStart: new RegExp("[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]"),
    NonAsciiIdentifierPart: new RegExp("[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]"),
    LeadingZeros: new RegExp("^0+(?!$)")
};

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {

    Regex: Regex,

    isDecimalDigit: function(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    },

    isHexDigit: function(ch) {
        return "0123456789abcdefABCDEF".indexOf(ch) >= 0;
    },

    isOctalDigit: function(ch) {
        return "01234567".indexOf(ch) >= 0;
    },

    // 7.2 White Space

    isWhiteSpace: function(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    },

    // 7.3 Line Terminators

    isLineTerminator: function(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    },

    // 7.6 Identifier Names and Identifiers

    isIdentifierStart: function(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    },

    isIdentifierPart: function(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    },

    // 7.6.1.2 Future Reserved Words

    isFutureReservedWord: function(id) {
        switch (id) {
            case "class":
            case "enum":
            case "export":
            case "extends":
            case "import":
            case "super":
                return true;
            default:
                return false;
        }
    },

    isStrictModeReservedWord: function(id, ecmaFeatures) {
        switch (id) {
            case "implements":
            case "interface":
            case "package":
            case "private":
            case "protected":
            case "public":
            case "static":
            case "yield":
            case "let":
                return true;
            case "await":
                return ecmaFeatures.modules;
            default:
                return false;
        }
    },

    isRestrictedWord: function(id) {
        return id === "eval" || id === "arguments";
    },

    // 7.6.1.1 Keywords

    isKeyword: function(id, strict, ecmaFeatures) {

        if (strict && this.isStrictModeReservedWord(id, ecmaFeatures)) {
            return true;
        }

        // "const" is specialized as Keyword in V8.
        // "yield" and "let" are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.

        switch (id.length) {
            case 2:
                return (id === "if") || (id === "in") || (id === "do");
            case 3:
                return (id === "var") || (id === "for") || (id === "new") ||
                    (id === "try") || (id === "let");
            case 4:
                return (id === "this") || (id === "else") || (id === "case") ||
                    (id === "void") || (id === "with") || (id === "enum");
            case 5:
                return (id === "while") || (id === "break") || (id === "catch") ||
                    (id === "throw") || (id === "const") || (!ecmaFeatures.generators && id === "yield") ||
                    (id === "class") || (id === "super");
            case 6:
                return (id === "return") || (id === "typeof") || (id === "delete") ||
                    (id === "switch") || (id === "export") || (id === "import");
            case 7:
                return (id === "default") || (id === "finally") || (id === "extends");
            case 8:
                return (id === "function") || (id === "continue") || (id === "debugger");
            case 10:
                return (id === "instanceof");
            default:
                return false;
        }
    },

    isJSXIdentifierStart: function(ch) {
        // exclude backslash (\)
        return (ch !== 92) && this.isIdentifierStart(ch);
    },

    isJSXIdentifierPart: function(ch) {
        // exclude backslash (\) and add hyphen (-)
        return (ch !== 92) && (ch === 45 || this.isIdentifierPart(ch));
    }


};

},{}],10:[function(require,module,exports){
/**
 * @fileoverview Contains token information.
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 * @copyright 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
 * @copyright 2011-2013 Ariya Hidayat <ariya.hidayat@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var Token = {
    BooleanLiteral: 1,
    EOF: 2,
    Identifier: 3,
    Keyword: 4,
    NullLiteral: 5,
    NumericLiteral: 6,
    Punctuator: 7,
    StringLiteral: 8,
    RegularExpression: 9,
    Template: 10,
    JSXIdentifier: 11,
    JSXText: 12
};

var TokenName = {};
TokenName[Token.BooleanLiteral] = "Boolean";
TokenName[Token.EOF] = "<end>";
TokenName[Token.Identifier] = "Identifier";
TokenName[Token.Keyword] = "Keyword";
TokenName[Token.NullLiteral] = "Null";
TokenName[Token.NumericLiteral] = "Numeric";
TokenName[Token.Punctuator] = "Punctuator";
TokenName[Token.StringLiteral] = "String";
TokenName[Token.RegularExpression] = "RegularExpression";
TokenName[Token.Template] = "Template";
TokenName[Token.JSXIdentifier] = "JSXIdentifier";
TokenName[Token.JSXText] = "JSXText";

// A function following one of those tokens is an expression.
var FnExprTokens = ["(", "{", "[", "in", "typeof", "instanceof", "new",
                "return", "case", "delete", "throw", "void",
                // assignment operators
                "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
                "&=", "|=", "^=", ",",
                // binary/unary operators
                "+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&",
                "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=",
                "<=", "<", ">", "!=", "!=="];


//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {
    Token: Token,
    TokenName: TokenName,
    FnExprTokens: FnExprTokens
};

},{}],11:[function(require,module,exports){
/**
 * @fileoverview The list of XHTML entities that are valid in JSX.
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {
    quot: "\u0022",
    amp: "&",
    apos: "\u0027",
    lt: "<",
    gt: ">",
    nbsp: "\u00A0",
    iexcl: "\u00A1",
    cent: "\u00A2",
    pound: "\u00A3",
    curren: "\u00A4",
    yen: "\u00A5",
    brvbar: "\u00A6",
    sect: "\u00A7",
    uml: "\u00A8",
    copy: "\u00A9",
    ordf: "\u00AA",
    laquo: "\u00AB",
    not: "\u00AC",
    shy: "\u00AD",
    reg: "\u00AE",
    macr: "\u00AF",
    deg: "\u00B0",
    plusmn: "\u00B1",
    sup2: "\u00B2",
    sup3: "\u00B3",
    acute: "\u00B4",
    micro: "\u00B5",
    para: "\u00B6",
    middot: "\u00B7",
    cedil: "\u00B8",
    sup1: "\u00B9",
    ordm: "\u00BA",
    raquo: "\u00BB",
    frac14: "\u00BC",
    frac12: "\u00BD",
    frac34: "\u00BE",
    iquest: "\u00BF",
    Agrave: "\u00C0",
    Aacute: "\u00C1",
    Acirc: "\u00C2",
    Atilde: "\u00C3",
    Auml: "\u00C4",
    Aring: "\u00C5",
    AElig: "\u00C6",
    Ccedil: "\u00C7",
    Egrave: "\u00C8",
    Eacute: "\u00C9",
    Ecirc: "\u00CA",
    Euml: "\u00CB",
    Igrave: "\u00CC",
    Iacute: "\u00CD",
    Icirc: "\u00CE",
    Iuml: "\u00CF",
    ETH: "\u00D0",
    Ntilde: "\u00D1",
    Ograve: "\u00D2",
    Oacute: "\u00D3",
    Ocirc: "\u00D4",
    Otilde: "\u00D5",
    Ouml: "\u00D6",
    times: "\u00D7",
    Oslash: "\u00D8",
    Ugrave: "\u00D9",
    Uacute: "\u00DA",
    Ucirc: "\u00DB",
    Uuml: "\u00DC",
    Yacute: "\u00DD",
    THORN: "\u00DE",
    szlig: "\u00DF",
    agrave: "\u00E0",
    aacute: "\u00E1",
    acirc: "\u00E2",
    atilde: "\u00E3",
    auml: "\u00E4",
    aring: "\u00E5",
    aelig: "\u00E6",
    ccedil: "\u00E7",
    egrave: "\u00E8",
    eacute: "\u00E9",
    ecirc: "\u00EA",
    euml: "\u00EB",
    igrave: "\u00EC",
    iacute: "\u00ED",
    icirc: "\u00EE",
    iuml: "\u00EF",
    eth: "\u00F0",
    ntilde: "\u00F1",
    ograve: "\u00F2",
    oacute: "\u00F3",
    ocirc: "\u00F4",
    otilde: "\u00F5",
    ouml: "\u00F6",
    divide: "\u00F7",
    oslash: "\u00F8",
    ugrave: "\u00F9",
    uacute: "\u00FA",
    ucirc: "\u00FB",
    uuml: "\u00FC",
    yacute: "\u00FD",
    thorn: "\u00FE",
    yuml: "\u00FF",
    OElig: "\u0152",
    oelig: "\u0153",
    Scaron: "\u0160",
    scaron: "\u0161",
    Yuml: "\u0178",
    fnof: "\u0192",
    circ: "\u02C6",
    tilde: "\u02DC",
    Alpha: "\u0391",
    Beta: "\u0392",
    Gamma: "\u0393",
    Delta: "\u0394",
    Epsilon: "\u0395",
    Zeta: "\u0396",
    Eta: "\u0397",
    Theta: "\u0398",
    Iota: "\u0399",
    Kappa: "\u039A",
    Lambda: "\u039B",
    Mu: "\u039C",
    Nu: "\u039D",
    Xi: "\u039E",
    Omicron: "\u039F",
    Pi: "\u03A0",
    Rho: "\u03A1",
    Sigma: "\u03A3",
    Tau: "\u03A4",
    Upsilon: "\u03A5",
    Phi: "\u03A6",
    Chi: "\u03A7",
    Psi: "\u03A8",
    Omega: "\u03A9",
    alpha: "\u03B1",
    beta: "\u03B2",
    gamma: "\u03B3",
    delta: "\u03B4",
    epsilon: "\u03B5",
    zeta: "\u03B6",
    eta: "\u03B7",
    theta: "\u03B8",
    iota: "\u03B9",
    kappa: "\u03BA",
    lambda: "\u03BB",
    mu: "\u03BC",
    nu: "\u03BD",
    xi: "\u03BE",
    omicron: "\u03BF",
    pi: "\u03C0",
    rho: "\u03C1",
    sigmaf: "\u03C2",
    sigma: "\u03C3",
    tau: "\u03C4",
    upsilon: "\u03C5",
    phi: "\u03C6",
    chi: "\u03C7",
    psi: "\u03C8",
    omega: "\u03C9",
    thetasym: "\u03D1",
    upsih: "\u03D2",
    piv: "\u03D6",
    ensp: "\u2002",
    emsp: "\u2003",
    thinsp: "\u2009",
    zwnj: "\u200C",
    zwj: "\u200D",
    lrm: "\u200E",
    rlm: "\u200F",
    ndash: "\u2013",
    mdash: "\u2014",
    lsquo: "\u2018",
    rsquo: "\u2019",
    sbquo: "\u201A",
    ldquo: "\u201C",
    rdquo: "\u201D",
    bdquo: "\u201E",
    dagger: "\u2020",
    Dagger: "\u2021",
    bull: "\u2022",
    hellip: "\u2026",
    permil: "\u2030",
    prime: "\u2032",
    Prime: "\u2033",
    lsaquo: "\u2039",
    rsaquo: "\u203A",
    oline: "\u203E",
    frasl: "\u2044",
    euro: "\u20AC",
    image: "\u2111",
    weierp: "\u2118",
    real: "\u211C",
    trade: "\u2122",
    alefsym: "\u2135",
    larr: "\u2190",
    uarr: "\u2191",
    rarr: "\u2192",
    darr: "\u2193",
    harr: "\u2194",
    crarr: "\u21B5",
    lArr: "\u21D0",
    uArr: "\u21D1",
    rArr: "\u21D2",
    dArr: "\u21D3",
    hArr: "\u21D4",
    forall: "\u2200",
    part: "\u2202",
    exist: "\u2203",
    empty: "\u2205",
    nabla: "\u2207",
    isin: "\u2208",
    notin: "\u2209",
    ni: "\u220B",
    prod: "\u220F",
    sum: "\u2211",
    minus: "\u2212",
    lowast: "\u2217",
    radic: "\u221A",
    prop: "\u221D",
    infin: "\u221E",
    ang: "\u2220",
    and: "\u2227",
    or: "\u2228",
    cap: "\u2229",
    cup: "\u222A",
    "int": "\u222B",
    there4: "\u2234",
    sim: "\u223C",
    cong: "\u2245",
    asymp: "\u2248",
    ne: "\u2260",
    equiv: "\u2261",
    le: "\u2264",
    ge: "\u2265",
    sub: "\u2282",
    sup: "\u2283",
    nsub: "\u2284",
    sube: "\u2286",
    supe: "\u2287",
    oplus: "\u2295",
    otimes: "\u2297",
    perp: "\u22A5",
    sdot: "\u22C5",
    lceil: "\u2308",
    rceil: "\u2309",
    lfloor: "\u230A",
    rfloor: "\u230B",
    lang: "\u2329",
    rang: "\u232A",
    loz: "\u25CA",
    spades: "\u2660",
    clubs: "\u2663",
    hearts: "\u2665",
    diams: "\u2666"
};

},{}],12:[function(require,module,exports){
module.exports={
  "name": "espree",
  "description": "An actively-maintained fork of Esprima, the ECMAScript parsing infrastructure for multipurpose analysis",
  "author": {
    "name": "Nicholas C. Zakas",
    "email": "nicholas+npm@nczconsulting.com"
  },
  "homepage": "https://github.com/eslint/espree",
  "main": "espree.js",
  "bin": {
    "esparse": "./bin/esparse.js",
    "esvalidate": "./bin/esvalidate.js"
  },
  "version": "2.2.4",
  "files": [
    "bin",
    "lib",
    "test/run.js",
    "test/runner.js",
    "test/test.js",
    "test/compat.js",
    "test/reflect.js",
    "espree.js"
  ],
  "engines": {
    "node": ">=0.10.0"
  },
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/eslint/espree.git"
  },
  "bugs": {
    "url": "http://github.com/eslint/espree.git"
  },
  "licenses": [
    {
      "type": "BSD",
      "url": "http://github.com/nzakas/espree/raw/master/LICENSE"
    }
  ],
  "devDependencies": {
    "browserify": "^7.0.0",
    "chai": "^1.10.0",
    "complexity-report": "~0.6.1",
    "dateformat": "^1.0.11",
    "eslint": "^0.9.2",
    "esprima": "git://github.com/jquery/esprima.git",
    "esprima-fb": "^8001.2001.0-dev-harmony-fb",
    "istanbul": "~0.2.6",
    "json-diff": "~0.3.1",
    "leche": "^1.0.1",
    "mocha": "^2.0.1",
    "npm-license": "^0.2.3",
    "optimist": "~0.6.0",
    "regenerate": "~0.5.4",
    "semver": "^4.1.1",
    "shelljs": "^0.3.0",
    "shelljs-nodecli": "^0.1.1",
    "unicode-6.3.0": "~0.1.0"
  },
  "keywords": [
    "ast",
    "ecmascript",
    "javascript",
    "parser",
    "syntax"
  ],
  "scripts": {
    "generate-regex": "node tools/generate-identifier-regex.js",
    "test": "npm run-script lint && node Makefile.js test && node test/run.js",
    "lint": "node Makefile.js lint",
    "patch": "node Makefile.js patch",
    "minor": "node Makefile.js minor",
    "major": "node Makefile.js major",
    "browserify": "node Makefile.js browserify",
    "coverage": "npm run-script analyze-coverage && npm run-script check-coverage",
    "analyze-coverage": "node node_modules/istanbul/lib/cli.js cover test/runner.js",
    "check-coverage": "node node_modules/istanbul/lib/cli.js check-coverage --statement 99 --branch 99 --function 99",
    "complexity": "npm run-script analyze-complexity && npm run-script check-complexity",
    "analyze-complexity": "node tools/list-complexity.js",
    "check-complexity": "node node_modules/complexity-report/src/cli.js --maxcc 14 --silent -l -w espree.js",
    "benchmark": "node test/benchmarks.js",
    "benchmark-quick": "node test/benchmarks.js quick"
  },
  "dependencies": {},
  "gitHead": "da58617f378c17fb01273f374f439956fb465aa7",
  "_id": "espree@2.2.4",
  "_shasum": "1068771b2c91aaf26a62ae4f9a46e74b34481219",
  "_from": "espree@>=2.2.4 <3.0.0",
  "_npmVersion": "1.4.28",
  "_npmUser": {
    "name": "nzakas",
    "email": "nicholas@nczconsulting.com"
  },
  "maintainers": [
    {
      "name": "nzakas",
      "email": "nicholas@nczconsulting.com"
    }
  ],
  "dist": {
    "shasum": "1068771b2c91aaf26a62ae4f9a46e74b34481219",
    "tarball": "http://registry.npmjs.org/espree/-/espree-2.2.4.tgz"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/espree/-/espree-2.2.4.tgz",
  "readme": "ERROR: No README data found!"
}

},{}],13:[function(require,module,exports){
/**
 * Shared code between binary and logical expressions
 *
 * @example
 *
 *  1. a + b + c
 *  2. a && b || c
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _parentheses = require('./parentheses');

var utils = _interopRequireWildcard(_parentheses);

function format(node, context, recur) {
    var leftParents = utils.needParentheses(node, node.left);
    var rightParents = utils.needParentheses(node, node.right);

    leftParents && context.write('(');
    recur(node.left);
    leftParents && context.write(')');

    context.write(' ', node.operator);

    var rollback = context.transaction();

    context.write(' ');
    rightParents && context.write('(');
    recur(node.right);
    rightParents && context.write(')');

    if (context.overflown()) {
        rollback();

        /**
         * Double indentation. Example:
         *  12345 || 3456789 &&
         *          67890;
         */
        context.indentIn();
        context.indentIn();
        context.write('\n', context.getIndent());
        context.indentOut();
        context.indentOut();

        rightParents && context.write('(');
        recur(node.right);
        rightParents && context.write(')');
    }
}
},{"./parentheses":74}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _line_terminator = require('./line_terminator');

var utils = _interopRequireWildcard(_line_terminator);

var _newlines = require('./newlines');

var newlines = _interopRequireWildcard(_newlines);

/**
 * Shared block formatting function
 *
 * @param {Object} node Program or BlockStatement
 * @param {Object} context
 * @param {Function} recur
 */

function format(node, context, recur) {
    var result = '';
    var blockComments = context.blockComments(node);

    for (var i = 0; i < node.body.length; i++) {
        var previous = node.body[i - 1];
        var child = node.body[i];
        var next = node.body[i + 1];

        if (child.type === 'EmptyStatement') {
            continue;
        }

        if (newlines.extraNewLineBetween(previous, child)) {
            context.write('\n');
        }

        context.write(blockComments.printLeading(child, previous, next));
        context.write(context.getIndent());
        recur(child);
        context.write(utils.getLineTerminator(child));
        context.write(blockComments.printTrailing(child, previous, next));

        if (next) {
            context.write('\n');
        }
    }
}
},{"./line_terminator":20,"./newlines":22}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BlockComments = (function () {
    function BlockComments(context, blockNode) {
        _classCallCheck(this, BlockComments);

        this.context = context;
        this.blockNode = blockNode;

        // Define left and right ranges for the current block
        if (blockNode.type === 'Program') {
            this.leftRange = 0;
            this.rightRange = context.maxRange();
        } else {
            this.leftRange = blockNode.range[0];
            this.rightRange = blockNode.range[1];
        }
    }

    /**
     * Print Leading comments for the given node.
     *
     * Leading comments are the comments above the node of the block
     * @example
     *
     *      // I'm a leading comment
     *      / * me too * /
     *      someBlockNode() { ... };
     *
     * Criteria:
     * Any comment that has
     *  1. comment.range[0] > previousNode.range[0]
     *      // take the left range of the prev node
     *      // we assume that its own comments were already extracted
     *      // @see https://github.com/eslint/espree/issues/41
     *
     *      AND
     *
     *  2. comment.range[0] < node.range[0]
     *
     * if it is the first node in the block then
     *  3. block.range[0] < comment.range[0]
     */

    _createClass(BlockComments, [{
        key: 'printLeading',
        value: function printLeading(node, prev, next) {
            var _this = this;

            var comments = [];
            var match = [];

            var leftRange = prev && prev.range[0] || this.leftRange;
            var rightRange = node.range[0];

            this.context.comments.forEach(function (comment) {
                if (comment.range[0] >= leftRange && comment.range[0] < rightRange) {
                    match.push(comment);
                } else {
                    comments.push(comment);
                }
            });

            // Remove found comments from the context.comments
            // TODO: move mutating logic to the context and expose a fn doing that
            this.context.comments = comments;

            return match.map(function (comment) {
                return _this.context.getIndent() + _this.printComment(comment) + '\n';
            }).join('');
        }

        /**
         * Trailing comments are the comments that are on the same line after
         * The node, or the comments within the block after the last node
         * @example
         *  if (true) {
         *      a + b; // i'm the trailing comment
         *      // i am NOT
         *      c + d; /* trailing! * / // i'm the trailing comment too
         *      // so am i
         *  }
         *
         *  Criteria:
         *      1. Same line trailing comments
         *          1.1. comment.range[0] > node.range[0] // includes comments within
         *              AND
         *          1.2 comment.range[0] < next.range[0]
         *              AND
         *          1.3 comment.loc.start.line === node.loc.end.line
         *      2. Comments after the node
         *          2.1 comment.range[0] > node.range[0]
         *          2.2 comment.range[1] < next.range[0]
         *
         */
    }, {
        key: 'printTrailing',
        value: function printTrailing(node, prev, next) {
            var _this2 = this;

            var sameLine = [];
            var after = [];
            var comments = [];
            var result = '';

            var leftRange = node.range[0];
            var rightRange = next && next.range[0] || this.rightRange;

            this.context.comments.forEach(function (comment) {
                if (comment.range[0] > leftRange && comment.range[0] < rightRange) {
                    if (comment.loc.start.line === node.loc.end.line) {
                        return sameLine.push(comment);
                    }

                    if (next) {
                        // that's a leading comment of the next node
                        // not trailing comment of this node
                        return comments.push(comment);
                    }

                    after.push(comment);
                } else {
                    comments.push(comment);
                }
            });

            // sanity check
            if (sameLine.filter(function (comment) {
                return comment.type === 'Line';
            }).length > 1) {
                throw new Error('there can be only one line comment on the line');
            };

            if (sameLine.length) {
                result = ' ' + sameLine.map(this.printComment.bind(this)).join(' ');
            }

            after.forEach(function (comment) {
                result += '\n' + _this2.context.getIndent() + _this2.printComment(comment);
            });

            // remove found comments from context
            this.context.comments = comments;

            return result;
        }
    }, {
        key: 'printComment',
        value: function printComment(comment) {
            switch (comment.type) {
                case 'Line':
                    return this.printLineComment(comment);
                case 'Block':
                    return this.printBlockComment(comment);
            }
        }
    }, {
        key: 'printLineComment',
        value: function printLineComment(comment) {
            return '//' + comment.value;
        }
    }, {
        key: 'printBlockComment',
        value: function printBlockComment(comment) {
            return '/*' + comment.value + '*/';
        }
    }]);

    return BlockComments;
})();

exports['default'] = BlockComments;
module.exports = exports['default'];
},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _block_comments = require('./block_comments');

var _block_comments2 = _interopRequireDefault(_block_comments);

var Context = (function () {
    /**
     * Create a context object for formatting
     *
     * @param {Object} config formatting configuration object
     *  @see ./default_config.js
     * @param {Object} ast parsed ast
     */

    function Context(config, ast) {
        _classCallCheck(this, Context);

        this.config = config;
        this.currentIndentation = 0;
        this.ast = ast;
        this.comments = ast.comments;
        this.result = '';
    }

    _createClass(Context, [{
        key: 'indentIn',
        value: function indentIn() {
            this.currentIndentation++;
        }
    }, {
        key: 'indentOut',
        value: function indentOut() {
            this.currentIndentation--;
        }

        // get a whitespace string containing X number of spaces, where
        // X is this.currentIndentation * this.config.indentation
    }, {
        key: 'getIndent',
        value: function getIndent() {
            var indent = new Array(this.config.indentation + 1).join(' ');
            return new Array(this.currentIndentation + 1).join(indent);
        }

        /**
         * Create a BlockComments object that will hold the state of
         * the current block
         *
         * @param {Object} blockNode Programm, BlockStatement, etc.
         */
    }, {
        key: 'blockComments',
        value: function blockComments(blockNode) {
            return new _block_comments2['default'](this, blockNode);
        }

        /**
         * return left range of the file
         * @return {Number}
         */
    }, {
        key: 'maxRange',
        value: function maxRange() {
            var lastCommentRange = undefined;

            if (this.comments.length) {
                lastCommentRange = this.comments[this.comments.length - 1].range[1];
            }

            return Math.max(this.ast.range[1], lastCommentRange || 0);
        }
    }, {
        key: 'write',
        value: function write(str) {
            if (arguments.length > 1) {
                str = '';

                for (var i = 0; i < arguments.length; i++) {
                    str += arguments[i];
                }
            }

            this.result += str;
        }
    }, {
        key: 'transaction',

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
         */
        value: function transaction() {
            var _this = this;
            var current = this.result;

            return function rollback() {
                _this.result = current;
            };
        }

        /**
         * Return whether any of the lines of the current written result
         * is longer than `config['max-len']` value
         */
    }, {
        key: 'overflown',
        value: function overflown() {
            var _this = this;

            return this.result.split('\n').some(function (line) {
                return line.length > _this.config['max-len'];
            });
        }
    }]);

    return Context;
})();

exports['default'] = Context;
module.exports = exports['default'];
},{"./block_comments":15}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    indentation: 4,
    newLineAtTheEnd: false,
    'max-len': 120
};
module.exports = exports['default'];
},{}],18:[function(require,module,exports){
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

var _espree = require('espree');

var _espree2 = _interopRequireDefault(_espree);

var _esprima_options = require('./esprima_options');

var _esprima_options2 = _interopRequireDefault(_esprima_options);

var _default_config = require('./default_config');

var _default_config2 = _interopRequireDefault(_default_config);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

require('../polyfills/includes');

var NODE_TYPES = {
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
    if (!node) {
        throw new Error('`node` argument is required. value: ' + JSON.stringify(node));
    }
    // find the node's namespace based on its type
    var nodeNamespace = NODE_TYPES[node.type];

    // recur function that will hold context and itself in a closule.
    // only if it's not defined (first call)
    recur || (recur = function (nextNode, nextOptions) {
        // console.log('next node: ', nextNode);
        formatAst(nextNode, context, recur, nextOptions);
    });

    if (!nodeNamespace) {
        throw new Error('unknown node type: ' + node.type);
    }

    nodeNamespace.format(node, context, recur, options);
}
},{"../polyfills/includes":75,"./context":16,"./default_config":17,"./esprima_options":19,"./nodes/array_expression":23,"./nodes/arrow_function_expression":24,"./nodes/assignment_expression":25,"./nodes/binary_expression":26,"./nodes/block_statement":27,"./nodes/call_expression":28,"./nodes/catch_clause":29,"./nodes/class_body":30,"./nodes/class_declaration":31,"./nodes/conditional_expression":32,"./nodes/do_while_statement":33,"./nodes/empty_statement":34,"./nodes/export_default_declaration":35,"./nodes/export_named_declaration":36,"./nodes/export_specifier":37,"./nodes/expression_statement":38,"./nodes/for_in_statement":39,"./nodes/for_statement":40,"./nodes/function_declaration":41,"./nodes/function_expression":42,"./nodes/identifier":43,"./nodes/if_statement":44,"./nodes/import_declaration":45,"./nodes/import_default_specifier":46,"./nodes/import_namespace_specifier":47,"./nodes/import_specifier":48,"./nodes/jsx_attribute":49,"./nodes/jsx_closing_element":50,"./nodes/jsx_element":51,"./nodes/jsx_expression_container":52,"./nodes/jsx_identifier":53,"./nodes/jsx_opening_element":54,"./nodes/literal":55,"./nodes/logical_expression":56,"./nodes/member_expression":57,"./nodes/method_definition":58,"./nodes/new_expression":59,"./nodes/object_expression":60,"./nodes/program":61,"./nodes/property":62,"./nodes/rest_element":63,"./nodes/return_statement":64,"./nodes/spread_element":65,"./nodes/super":66,"./nodes/this_expression":67,"./nodes/throw_statement":68,"./nodes/try_statement":69,"./nodes/unary_expression":70,"./nodes/update_expression":71,"./nodes/variable_declaration":72,"./nodes/variable_declarator":73,"espree":2}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {
    // Nodes have line and column-based location info
    loc: true,

    // Nodes have an index-based location range (array)
    range: true,

    // Literals have extra property which stores the verbatim source
    raw: false,

    // An extra array containing all found tokens
    tokens: false,

    // An extra array containing all line and block comments
    comment: true,

    // attach comments to the closest relevant node as leadingComments and
    // trailingComments
    attachComment: false,

    //An extra array containing all errors found, attempts to
    //continue parsing when an error is encountered
    tolerant: false,

    ecmaFeatures: {
        // enable parsing of arrow functions
        arrowFunctions: true,

        // enable parsing of let/const
        blockBindings: true,

        // enable parsing of destructured arrays and objects
        destructuring: true,

        // enable parsing of regular expression y flag
        regexYFlag: true,

        // enable parsing of regular expression u flag
        regexUFlag: true,

        // enable parsing of template strings
        templateStrings: true,

        // enable parsing of binary literals
        binaryLiterals: true,

        // enable parsing of ES6 octal literals
        octalLiterals: true,

        // enable parsing unicode code point escape sequences
        unicodeCodePointEscapes: true,

        // enable parsing of default parameters
        defaultParams: true,

        // enable parsing of rest parameters
        restParams: true,

        // enable parsing of for-of statement
        forOf: true,

        // enable parsing computed object literal properties
        objectLiteralComputedProperties: true,

        // enable parsing of shorthand object literal methods
        objectLiteralShorthandMethods: true,

        // enable parsing of shorthand object literal properties
        objectLiteralShorthandProperties: true,

        // Allow duplicate object literal properties (except '__proto__')
        objectLiteralDuplicateProperties: true,

        // enable parsing of generators/yield
        generators: true,

        // enable parsing spread operator
        spread: true,

        // enable super in functions
        superInFunctions: true,

        // enable parsing classes
        classes: true,

        // enable parsing of new.target
        newTarget: false,

        // enable parsing of modules
        modules: true,

        // enable React JSX parsing
        jsx: true,

        // enable return in global scope
        globalReturn: true,

        // allow experimental object rest/spread
        experimentalObjectRestSpread: true
    }
};
module.exports = exports["default"];
},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getLineTerminator = getLineTerminator;
var DONT_NEED_SEMICOLON_AFTER = {
    ForInStatement: true,
    ForStatement: true,
    FunctionDeclaration: true,
    IfStatement: true,
    TryStatement: true,
    ClassDeclaration: true
};

/**
 * @param {Object} node esprima node
 */

function getLineTerminator(node) {
    return DONT_NEED_SEMICOLON_AFTER[node.type] ? '' : ';';
}
},{}],21:[function(require,module,exports){
/**
 * List is a list of comma separated elements
 * @example
 *
 * 1. function call
 *      a.b(1, 2, 3, 4)
 * 2. function declaration
 *      function abc(a, b, c) {}
 * 3. module import
 *      import {a, b, c} from 'module';
 * 4. module export
 *      export {a as m, b, c};
 * etc.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.long = long;
exports.short = short;
var WRAPPERS = {
    '[]': { left: '[', right: ']' },
    '{}': { left: '{', right: '}' },
    '()': { left: '(', right: ')' }
};

/**
 * Render the long version of the list
 *
 * @example
 *  [1, 2, 3, 4, 5]
 */

function long(nodes, context, recur, wrap) {
    context.write(WRAPPERS[wrap].left);

    for (var i = 0; i < nodes.length; i++) {
        recur(nodes[i]);

        if (nodes[i + 1]) {
            context.write(', ');
        }
    }

    context.write(WRAPPERS[wrap].right);
}

/**
 * Render the short or compact version of the list
 *
 * @example
 *  [
 *      1,
 *      2,
 *      3,
 *      4
 *  ]
 */

function short(nodes, context, recur, wrap) {
    context.write(WRAPPERS[wrap].left);
    context.indentIn();
    context.write('\n');

    for (var i = 0; i < nodes.length; i++) {
        context.write(context.getIndent());
        recur(nodes[i]);

        if (nodes[i + 1]) {
            context.write(',\n');
        }
    }

    context.indentOut();
    context.write('\n', context.getIndent(), WRAPPERS[wrap].right);
}
},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.extraNewLineBetween = extraNewLineBetween;
var NEED_EXTRA_NEWLINE_AFTER = {
    BlockStatement: true,
    VariableDeclaration: true,
    FunctionExpression: true,
    FunctionDeclaration: true,
    IfStatement: true,
    ForStatement: true,
    ObjectExpression: true
};

var NEED_NEWLINE_BEFORE = {
    ifStatement: true,
    ForStatement: true,
    VariableDeclaration: true,
    FunctionDeclaration: true
};

/**
 * Some elements of the body of the block (Programm, BlockStatement)
 * need to know whether they need to prepend a newline before them.
 *
 * Example can be
 *  1. Any element after imports declaration
 *      import A from 'a';
 *      import B from 'b';
 *
 *      A.b() + B.c();
 *
 *  2. anything after if else block
 *      if (a) {
 *          return b;
 *      }
 *
 *      a + b;
 *
 *
 * @param {Object} previous node
 * @param {Object} current node
 */

function extraNewLineBetween(previous, current) {
    // no new line before the first element of the block
    if (!previous) {
        return false;
    }

    /**
     * always have newline before return, unless it's the only statement
     */
    if (previous && current.type === 'ReturnStatement') {
        return true;
    }

    // group var declarations together
    // Example
    //  var a = 5;
    //  var b = 5;
    //  var l;
    if (previous.type === 'VariableDeclaration' && current.type === 'VariableDeclaration') {
        return false;
    }

    if (NEED_NEWLINE_BEFORE[current.type]) {
        return true;
    }

    if (NEED_EXTRA_NEWLINE_AFTER[previous.type]) {
        return true;
    }

    if (previous.type === 'ImportDeclaration' && current.type !== 'ImportDeclaration') {
        return true;
    }

    if (newLineAfterCompositeExpressions(previous)) {
        return true;
    }

    return false;
}

/**
 * Returns true if newline is needed after the composite expression
 *
 * Examples:
 *  1. Assignment expression
 *      a.b.c = function() {
 *          return 4;
 *      }
 *
 *  2. a + function() {
 *         return 2;
 *     }
 *
 */
function newLineAfterCompositeExpressions(previous) {
    if (['BinaryExpression', 'AssignmentExpression'].includes(previous.type)) {
        if (NEED_EXTRA_NEWLINE_AFTER[previous.right.type]) {
            return true;
        }
    }

    if (previous.type === 'ExpressionStatement') {
        var expression = previous.expression;

        switch (expression.type) {
            case 'AssignmentExpression':
                return NEED_EXTRA_NEWLINE_AFTER[expression.right.type];
                break;
        }
    }
}
},{}],23:[function(require,module,exports){
/**
 *  {
 *      type: 'ArrayExpression',
 *      elements: [{
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      }, {
 *          type: 'Literal',
 *          value: '2',
 *          raw: '\'2\''
 *      }, {
 *          type: 'Identifier',
 *          name: 'abc'
 *      }, {
 *          type: 'Literal',
 *          value: null,
 *          raw: 'null'
 *      }, {
 *          type: 'Identifier',
 *          name: 'undefined'
 *      }]
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    var rollback = context.transaction();

    (0, _list.long)(node.elements, context, recur, '[]');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.elements, context, recur, '[]');
    };
}
},{"../list":21}],24:[function(require,module,exports){
/**
 *  {
 *      type: 'ArrowFunctionExpression',
 *      id: null,
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }],
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      generator: false,
 *      expression: false
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    if (node.id) {
        context.write(node.id);
    }

    var rollback = context.transaction();

    (0, _list.long)(node.params, context, recur, '()');
    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.params, context, recur, '()');
    }

    context.write(' => ');
    recur(node.body);
}

;
},{"../list":21}],25:[function(require,module,exports){
/**
 *  { type: 'AssignmentExpression',
 *    operator: '=',
 *    left: { type: 'Identifier', name: 'abc' },
 *    right: { type: 'Identifier', name: 'cde' } }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.left);
  context.write(' ', node.operator, ' ');
  recur(node.right);
}
},{}],26:[function(require,module,exports){
/**
 *  {
 *      type: 'BinaryExpression',
 *      operator: '+',
 *      left: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _binary = require('../binary');

var binary = _interopRequireWildcard(_binary);

function format(node, context, recur) {
  binary.format(node, context, recur);
}
},{"../binary":13}],27:[function(require,module,exports){
/**
 *  {
 *      type: 'BlockStatement',
 *      body: [{
 *          type: 'ReturnStatement',
 *          argument: [Object]
 *      }]
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _block = require('../block');

function format(node, context, recur) {
    if (!node.body.length) {
        return context.write('{}');
    }

    context.write('{\n');
    context.indentIn();
    (0, _block.format)(node, context, recur);
    context.indentOut();
    context.write('\n', context.getIndent(), '}');
}

;
},{"../block":14}],28:[function(require,module,exports){
/**
 *  {
 *      type: 'CallExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      arguments: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }]
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    recur(node.callee);

    var rollback = context.transaction();

    (0, _list.long)(node.arguments, context, recur, '()');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.arguments, context, recur, '()');
    }
}
},{"../list":21}],29:[function(require,module,exports){
/**
 *  {
 *      type: 'CatchClause',
 *      param: {
 *          type: 'Identifier',
 *          name: 'e'
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: []
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('catch (');
  recur(node.param);
  context.write(') ');
  recur(node.body);
}
},{}],30:[function(require,module,exports){
/**
 *  {
 *      type: 'ClassBody',
 *      body: [{
 *          type: 'MethodDefinition',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'constructor',
 *          computed: false,
 *          static: false
 *      }, {
 *          type: 'MethodDefinition',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'get',
 *          computed: false,
 *          static: false
 *      }, {
 *          type: 'MethodDefinition',
 *          key: [Object],
 *          value: [Object],
 *          kind: 'method',
 *          computed: false,
 *          static: false
 *      }]
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('{');
    context.indentIn();

    for (var i = 0; i < node.body.length; i++) {
        if (node.body[i - 1]) {
            context.write('\n');
        }

        context.write('\n', context.getIndent());
        recur(node.body[i]);
    }

    context.indentOut();
    context.write('\n', context.getIndent(), '}');
}

;
},{}],31:[function(require,module,exports){
/**
 *  {
 *     type: 'ClassDeclaration',
 *     id: {
 *         type: 'Identifier',
 *         name: 'ABC',
 *         range: [6, 9],
 *         loc: {
 *             start: [Object],
 *             end: [Object]
 *         }
 *     },
 *     superClass: {
 *         type: 'MemberExpression',
 *         computed: false,
 *         object: {
 *             type: 'Identifier',
 *             name: 'React',
 *             range: [Object],
 *             loc: [Object]
 *         },
 *         property: {
 *             type: 'Identifier',
 *             name: 'Component',
 *             range: [Object],
 *             loc: [Object]
 *         },
 *         range: [18, 33],
 *         loc: {
 *             start: [Object],
 *             end: [Object]
 *         }
 *     },
 *     body: {
 *         type: 'ClassBody',
 *         body: [
 *             [Object],
 *             [Object],
 *             [Object]
 *         ],
 *         range: [34, 140],
 *         loc: {
 *             start: [Object],
 *             end: [Object]
 *         }
 *     },
 * }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('class ');
    recur(node.id);

    if (node.superClass) {
        context.write(' extends ');
        recur(node.superClass);
    }

    context.write(' ');
    recur(node.body);
}

;
},{}],32:[function(require,module,exports){
/**
 *  {
 *      type: 'ConditionalExpression',
 *      test: {
 *          type: 'LogicalExpression',
 *          operator: '||',
 *          left: {
 *              type: 'Identifier',
 *              name: 'a'
 *          },
 *          right: {
 *              type: 'Identifier',
 *              name: 'b'
 *          }
 *      },
 *      consequent: {
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      },
 *      alternate: {
 *          type: 'Literal',
 *          value: true,
 *          raw: 'true'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.test);
  context.write(' ? ');
  recur(node.consequent);
  context.write(' : ');
  recur(node.alternate);
}
},{}],33:[function(require,module,exports){
/**
 *  {
 *      type: 'DoWhileStatement',
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object],
 *              [Object]
 *          ],
 *          range: [3269, 3329]
 *      },
 *      test: {
 *          type: 'BinaryExpression',
 *          operator: '!=',
 *          left: {
 *              type: 'Identifier',
 *              name: 'initialState',
 *              range: [Object]
 *          },
 *          right: {
 *              type: 'MemberExpression',
 *              computed: false,
 *              object: [Object],
 *              property: [Object],
 *              range: [Object]
 *          },
 *          range: [3337, 3366]
 *      },
 *      range: [3266, 3368]
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('do ');
  recur(node.body);
  context.write(' while (');
  recur(node.test);
  context.write(')');
}
},{}],34:[function(require,module,exports){
/**
 *  {
 *      type: 'EmptyStatement',
 *      range: [614, 615],
 *      loc: {
 *          start: {
 *              line: 27,
 *              column: 5
 *          },
 *          end: {
 *              line: 27,
 *              column: 6
 *          }
 *      }
 *  };
 *
 *  Empty statement is a result of unnecessary ;
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {}

;
},{}],35:[function(require,module,exports){
/**
 *  {
 *      type: 'ExportDefaultDeclaration',
 *      declaration: {
 *          type: 'Identifier',
 *          name: 'A',
 *          range: [15, 16],
 *          loc: {
 *              start: [Object],
 *              end: [Object]
 *          }
 *      },
 *      range: [0, 16],
 *      loc: {
 *          start: {
 *              line: 1,
 *              column: 0
 *          },
 *          end: {
 *              line: 1,
 *              column: 16
 *          }
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('export default ');
  recur(node.declaration);
}
},{}],36:[function(require,module,exports){
/**
 *  {
 *      type: 'ExportNamedDeclaration',
 *      declaration: {
 *          type: 'FunctionDeclaration',
 *          id: {
 *              type: 'Identifier',
 *              name: 'abc',
 *          },
 *          params: [],
 *          body: {
 *              type: 'BlockStatement',
 *              body: [Object],
 *          },
 *          generator: false,
 *          expression: false,
 *      },
 *      specifiers: [],
 *      source: null,
 *      range: [0, 34],
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    if (node.declaration) {
        context.write('export ');
        recur(node.declaration);
    } else {
        var rollback = context.transaction();

        // specifiers
        context.write('export ');

        (0, _list.long)(node.specifiers, context, recur, '{}');

        if (context.overflown()) {
            rollback();

            (0, _list.short)(node.specifiers, context, recur, '{}');
        }
    }
}
},{"../list":21}],37:[function(require,module,exports){
/**
 *  {
 *      type: 'ExportSpecifier',
 *      exported: {
 *          type: 'Identifier',
 *          name: 'a',
 *          range: [8, 9],
 *          loc: {
 *              start: [Object],
 *              end: [Object]
 *          }
 *      },
 *      local: {
 *          type: 'Identifier',
 *          name: 'a',
 *          range: [8, 9],
 *          loc: {
 *              start: [Object],
 *              end: [Object]
 *          }
 *      },
 *      range: [8, 9],
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    if (node.exported.name === node.local.name) {
        recur(node.exported);
    } else {
        recur(node.local);
        context.write(' as ');
        recur(node.exported);
    }
}
},{}],38:[function(require,module,exports){
/**
 *  {
 *      type: 'ExpressionStatement',
 *      expression: {
 *          type: 'CallExpression', // AssignmentExpression
 *          callee: {
 *              type: 'Identifier',
 *              name: 'abc'
 *          },
 *          arguments: [
 *              [Object],
 *              [Object]
 *          ]
 *      }
 *  }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.expression);
}
},{}],39:[function(require,module,exports){
/**
 *  {
 *      type: 'ForInStatement',
 *      left: {
 *          type: 'VariableDeclaration',
 *          declarations: [
 *              [Object]
 *          ],
 *          kind: 'var'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'result'
 *      },
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      each: false
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('for (');
  recur(node.left);
  context.write(' in ');
  recur(node.right);
  context.write(') ');
  recur(node.body);
}
},{}],40:[function(require,module,exports){
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
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('for (');
  recur(node.init);
  context.write('; ');
  recur(node.test);
  context.write('; ');
  recur(node.update);
  context.write(') ');
  recur(node.body);
}
},{}],41:[function(require,module,exports){
/**
 *  {
 *      type: 'FunctionDeclaration',
 *      id: {
 *          type: 'Identifier',
 *          name: 'abc'
 *      },
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }, {
 *          type: 'Identifier',
 *          name: 'b'
 *      }],
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      generator: false,
 *      expression: false
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    context.write('function ');
    recur(node.id);

    var rollback = context.transaction();

    (0, _list.long)(node.params, context, recur, '()');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.params, context, recur, '()');
    };

    context.write(' ');
    recur(node.body);
}
},{"../list":21}],42:[function(require,module,exports){
/**
 *  {
 *      type: 'FunctionExpression',
 *      id: { type: 'Identifier', name: 'fn' },
 *      params: [{
 *          type: 'Identifier',
 *          name: 'a'
 *      }],
 *      body: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      generator: false,
 *      expression: false
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

/**
 * @param {Boolean} noFunctionKeyword if set to true, then `function` will not be printed.
 *  in class definitions the `constructor` is defined in the class itself, and the function
 *  declaration is expected to be just `() {}`
 *
 *      class A {
 *          constructor() {
 *          }
 *      }
 */

function format(node, context, recur) {
    var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    var noFunctionKeyword = _ref.noFunctionKeyword;

    if (!noFunctionKeyword) {
        context.write('function');
    }

    if (node.id) {
        context.write(' ');
        recur(node.id);
    }

    var rollback = context.transaction();

    (0, _list.long)(node.params, context, recur, '()');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.params, context, recur, '()');
    };

    context.write(' ');
    recur(node.body);
}
},{"../list":21}],43:[function(require,module,exports){
/**
 * { type: 'Identifier', name: 'a' }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write(node.name);
}
},{}],44:[function(require,module,exports){
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
},{"../line_terminator":20}],45:[function(require,module,exports){
/**
 *  {
 *      type: 'ImportDeclaration',
 *      specifiers: [{
 *          type: 'ImportDefaultSpecifier',
 *          local: [Object]
 *      }],
 *      source: {
 *          type: 'Literal',
 *          value: 'a',
 *          raw: '\'a\''
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    var specs = {
        ImportDefaultSpecifier: null,
        ImportSpecifier: [],
        ImportNamespaceSpecifier: null
    };

    context.write('import ');

    // There can be one ImportDefaultSpecifier // A, A as B
    // There can be multiple ImportSpecifiers // {a, b as c}
    // They can be combined with ImportDefaultSpecifier // A, {b}
    // ImportNamespace Specifer can only be used alone // * as C
    node.specifiers.forEach(function (spec) {
        switch (spec.type) {
            case 'ImportSpecifier':
                specs.ImportSpecifier.push(spec); // {a} or {b as c}
                break;
            case 'ImportDefaultSpecifier':
                specs.ImportDefaultSpecifier = spec; // import A from 'a';
                break;
            case 'ImportNamespaceSpecifier':
                specs.ImportNamespaceSpecifier = spec; // import * as e from 'a'
                break;
        }
    });

    if (specs.ImportNamespaceSpecifier) {
        recur(specs.ImportNamespaceSpecifier);
    }

    if (specs.ImportDefaultSpecifier) {
        recur(specs.ImportDefaultSpecifier);

        if (specs.ImportSpecifier.length) {
            context.write(', ');
        }
    }

    if (specs.ImportSpecifier.length) {
        var rollback = context.transaction();

        (0, _list.long)(specs.ImportSpecifier, context, recur, '{}');

        if (context.overflown()) {
            rollback();
            (0, _list.short)(specs.ImportSpecifier, context, recur, '{}');
        }
    }

    context.write(' from ');
    recur(node.source);
}
},{"../list":21}],46:[function(require,module,exports){
/**
 *   {
 *      type: 'ImportDefaultSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'A'
 *      }
 *  }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.local);
}
},{}],47:[function(require,module,exports){
/**
 *  {
 *      type: 'ImportNamespaceSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'A'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('* as ');
  recur(node.local);
}
},{}],48:[function(require,module,exports){
/**
 *  {
 *      type: 'ImportSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'b'
 *      },
 *      imported: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  } {
 *      type: 'ImportSpecifier',
 *      local: {
 *          type: 'Identifier',
 *          name: 'd'
 *      },
 *      imported: {
 *          type: 'Identifier',
 *          name: 'c'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    if (node.local.name === node.imported.name) {
        recur(node.local);
    } else {
        recur(node.imported);
        context.write(' as ');
        recur(node.local);
    }
}
},{}],49:[function(require,module,exports){
/**
 *    {
 *        type: 'JSXAttribute',
 *        name: {
 *            type: 'JSXIdentifier',
 *            name: 'className'
 *        },
 *        value: {
 *            type: 'Literal',
 *            value: 'abc',
 *            raw: '"abc"'
 *        }
 *    }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.name);
  context.write('=');
  recur(node.value);
}
},{}],50:[function(require,module,exports){
/**
 *  {
 *      type: 'JSXClosingElement',
 *      name: {
 *          type: 'JSXIdentifier',
 *          name: 'div'
 *      }
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('</');
  recur(node.name);
  context.write('>');
}
},{}],51:[function(require,module,exports){
/**
 *  {
 *      type: 'JSXElement',
 *      openingElement: {
 *          type: 'JSXOpeningElement',
 *          name: {
 *              type: 'JSXIdentifier',
 *              name: 'div'
 *          },
 *          selfClosing: false,
 *          attributes: []
 *      },
 *      closingElement: {
 *          type: 'JSXClosingElement',
 *          name: {
 *              type: 'JSXIdentifier',
 *              name: 'div'
 *          }
 *      },
 *      children: []
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    recur(node.openingElement);

    if (node.closingElement) {
        var i = undefined;
        // Don't print literals that have only whitespace
        var elements = node.children.filter(notWhitespaceLiteral);

        context.indentIn();

        for (i = 0; i < elements.length; i++) {
            var child = elements[i];
            var prev = elements[i - 1];

            if (needLinebreak(child, prev)) {
                context.write('\n', context.getIndent());
            }

            recur(child);
        }

        // the last linebreak
        if (elements.length) {
            context.write('\n');
        }

        context.indentOut();
        context.write(context.getIndent());
        recur(node.closingElement);
    }
}

function needLinebreak(node, prev) {
    // if it's the first child
    if (!prev) {
        return true;
    }

    // if the previous was a jsx tag. Example:
    //
    // <br />
    // 'abc'
    if (prev && prev.type === 'JSXElement') {
        return true;
    }
}

/**
 * JSX contents are parsed as a bunch of whitespace literals
 * for example the following structure
 *  <div>
 *      <App />
 *  </div>
 *
 * Will have childre elements
 *  1. "\n    "
 *  2. <App />
 *  3. "\n"
 *
 * We want to reformat it, so we strip down all whitespaces, so that
 * we can add them later in the right order with correct indentation.
 */
function notWhitespaceLiteral(node) {
    if (node.type === 'Literal') {
        return !node.raw.match(/^\s+$/);
    }

    return true;
}
},{}],52:[function(require,module,exports){
/**
 *  {
 *      type: 'JSXExpressionContainer',
 *      expression: {
 *          type: 'Identifier',
 *          name: 'test'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('{');
  recur(node.expression);
  context.write('}');
}
},{}],53:[function(require,module,exports){
/**
 * { type: 'JSXIdentifier', name: 'div' }
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write(node.name);
}
},{}],54:[function(require,module,exports){
/**
 *  {
 *      type: 'JSXOpeningElement',
 *      name: {
 *          type: 'JSXIdentifier',
 *          name: 'span'
 *      },
 *      selfClosing: false,
 *      attributes: [{ type: 'JSXAttribute', name: [Object], value: [Object] }]
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('<');
    recur(node.name);

    if (node.attributes.length) {
        context.write(' ');

        for (var i = 0; i < node.attributes.length; i++) {
            recur(node.attributes[i]);

            if (node.attributes[i + 1]) {
                context.write(' ');
            }
        }
    };

    if (node.selfClosing) {
        context.write(' /');
    }

    context.write('>');
}
},{}],55:[function(require,module,exports){
/**
 * { type: 'Literal', value: 5, raw: '5' }
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write(node.raw);
}

;
},{}],56:[function(require,module,exports){
/**
 *  {
 *      type: 'LogicalExpression',
 *      operator: '||',
 *      left: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      right: {
 *          type: 'Identifier',
 *          name: 'b'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _binary = require('../binary');

var binary = _interopRequireWildcard(_binary);

function format(node, context, recur) {
  binary.format(node, context, recur);
}

;
},{"../binary":13}],57:[function(require,module,exports){
/**
 *  {
 *      type: 'MemberExpression',
 *      computed: false,
 *      object: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      property: {
 *          type: 'Identifier',
 *          name: 'bc'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    recur(node.object);
    if (node.computed) {
        context.write('[');
        recur(node.property);
        context.write(']');
    } else {
        context.write('.');
        recur(node.property);
    }
}

;
},{}],58:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    if (node['static']) {
        context.write('static ');
    }

    if (node.kind === 'get') {
        context.write('get ');
    }

    if (node.kind === 'set') {
        context.write('set ');
    }

    recur(node.key);
    recur(node.value, { noFunctionKeyword: true });
}

;
},{"../list":21}],59:[function(require,module,exports){
/**
 *  {
 *      type: 'NewExpression',
 *      callee: {
 *          type: 'Identifier',
 *          name: 'Constr'
 *      },
 *      arguments: []
 *  }
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _list = require('../list');

function format(node, context, recur) {
    context.write('new ');
    recur(node.callee);

    var rollback = context.transaction();

    (0, _list.long)(node.arguments, context, recur, '()');

    if (context.overflown()) {
        rollback();
        (0, _list.short)(node.arguments, context, recur, '()');
    };
}
},{"../list":21}],60:[function(require,module,exports){
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
},{"../parentheses":74}],61:[function(require,module,exports){
/**
 *  {
 *      type: 'Program',
 *      body: [{}, {}],
 *      sourceType: 'module'
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

var _block = require('../block');

function format(node, context, recur) {
    (0, _block.format)(node, context, recur);
    if (context.config.newLineAtTheEnd) {
        context.write('\n');
    }
}

;
},{"../block":14}],62:[function(require,module,exports){
/**
 *  {
 *      type: 'Property',
 *      key: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      value: {
 *          type: 'Literal',
 *          value: 1,
 *          raw: '1'
 *      },
 *      kind: 'init',
 *      method: false,
 *      shorthand: false,
 *      computed: false
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  recur(node.key);
  context.write(': ');
  recur(node.value);
}

;
},{}],63:[function(require,module,exports){
/**
 *  {
 *      type: 'RestElement',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'args'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('...');
  recur(node.argument);
}

;
},{}],64:[function(require,module,exports){
/**
 *    argument: {
 *        type: 'BinaryExpression',
 *        operator: '+',
 *        left: {
 *            type: 'Identifier',
 *            name: 'a'
 *        },
 *        right: {
 *            type: 'Identifier',
 *            name: 'b'
 *        }
 *    }
 *    }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('return');
    if (node.argument) {
        context.write(' ');
        recur(node.argument);
    }
}

;
},{}],65:[function(require,module,exports){
/**
 *  {
 *      type: 'SpreadElement',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'args'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('...');
  recur(node.argument);
}
},{}],66:[function(require,module,exports){
/**
 *  {
 *      type: 'Super',
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('super');
}
},{}],67:[function(require,module,exports){
/**
 *  { type: 'ThisExpression' }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('this');
}

;
},{}],68:[function(require,module,exports){
/**
 *  {
 *      type: 'ThrowStatement',
 *      argument: {
 *          type: 'NewExpression',
 *          callee: {
 *              type: 'Identifier',
 *              name: 'Error',
 *              range: [Object]
 *          },
 *          arguments: [
 *              [Object]
 *          ],
 *          range: [3551, 3577]
 *      },
 *      range: [3545, 3578]
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;

function format(node, context, recur) {
  context.write('throw ');
  recur(node.argument);
}

;
},{}],69:[function(require,module,exports){
/**
 *  {
 *      type: 'TryStatement',
 *      block: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      },
 *      handler: {
 *          type: 'CatchClause',
 *          param: {
 *              type: 'Identifier',
 *              name: 'e'
 *          },
 *          body: {
 *              type: 'BlockStatement',
 *              body: []
 *          }
 *      },
 *      finalizer: {
 *          type: 'BlockStatement',
 *          body: [
 *              [Object]
 *          ]
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    context.write('try ');
    recur(node.block);
    if (node.handler) {
        context.write(' ');
        recur(node.handler);
    }

    if (node.finalizer) {
        context.write(' finally ');
        recur(node.finalizer);
    }
}

;
},{}],70:[function(require,module,exports){
/**
 *  {
 *      type: 'UnaryExpression',
 *      operator: 'void',
 *      argument: {
 *          type: 'Literal',
 *          value: 0,
 *          raw: '0'
 *      },
 *      prefix: true
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    if (node.operator === 'void') {
        context.write(node.operator, '(');
        recur(node.argument);
        context.write(')');
    } else if (node.operator === 'typeof') {
        context.write(node.operator, ' ');
        recur(node.argument);
    } else {
        context.write(node.operator);
        recur(node.argument);
    }
}

;
},{}],71:[function(require,module,exports){
/**
 *  {
 *      type: 'UpdateExpression',
 *      operator: '++',
 *      argument: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      prefix: false
 *  }
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    if (node.prefix) {
        context.write(node.operator);
        recur(node.argument);
    } else {
        recur(node.argument);
        context.write(node.operator);
    }
}

;
},{}],72:[function(require,module,exports){
/**
 *  {
 *      type: 'VariableDeclaration',
 *      declarations: [{
 *          type: 'VariableDeclarator',
 *          id: [Object],
 *          init: [Object]
 *      }],
 *      kind: 'var'
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;
var DONT_INDENT = {
    FunctionDeclaration: true
};

function format(node, context, recur) {
    context.write(node.kind, ' ');
    var indent = true;

    /**
     * If var declaration consists of one element and it's a function
     * it should not be indented
     * Example:
     *  let a = function() {
     *      return 1;
     *  };
     */
    if (node.declarations.length === 1) {
        indent = !!DONT_INDENT[node.declarations[0].type];
    }

    indent && context.indentIn();
    for (var i = 0; i < node.declarations.length; i++) {
        recur(node.declarations[i]);
        if (node.declarations[i + 1]) {
            context.write(',\n', context.getIndent());
        }
    }

    indent && context.indentOut();
}

;
},{}],73:[function(require,module,exports){
/**
 *  {
 *      type: 'VariableDeclarator',
 *      id: {
 *          type: 'Identifier',
 *          name: 'a'
 *      },
 *      init: {
 *          type: 'Literal',
 *          value: 5,
 *          raw: '5'
 *      }
 *  }
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.format = format;

function format(node, context, recur) {
    recur(node.id);
    if (node.init) {
        context.write(' = ');
        recur(node.init);
    }
}

;
},{}],74:[function(require,module,exports){
/**
 * Map of operators to their precendenge numeric value (starting from 1),
 * the lower the index, the higher the precedence
 *
 * @example
 *  {'*': 5, '+': 4, '=': 3, ...}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.needParentheses = needParentheses;
exports.wrapInParantheses = wrapInParantheses;
var PRECEDENCE = {};

[['*', '/'], ['+', '-'], ['<<', '>>', '>>>'], ['<', '>', '<=', '>='], ['==', '===', '!=', '!=='], ['&'], ['^'], ['|'], ['&&'], ['||'], ['=', '+=', '-=', '**=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']].forEach(function (ops, index) {
    ops.forEach(function (op) {
        return PRECEDENCE[op] = index + 1;
    }); // + 1 to avoid evaluating 0 to false
});

/**
 * Nodes that may need grouping perentheses depending on the context
 * they are used in. e.g. `a + 1` may need parantheses if it's used
 * as a right or left part of another operation `4 / (a + 1)`
 */
var MAY_NEED_PARENTHESES = {
    BinaryExpression: true,
    AssignmentExpression: true,
    LogicalExpression: true
};

/**
 * Some expressions may have expression inside them, and the precedence
 * can conflict. For example:
 *   (1 + 2) / 3
 *
 * The AST of this like will look like this:
 *  BinaryExpression:
 *      operator: /
 *      left:
 *          BinaryExpression:
 *              operator: +
 *              left: 1
 *              right: 2
 *      right: 3
 *
 * In this case, the left part needs grouping parentheses around it, otherwise
 * `/` operator will take presedence (eg. `1 + 2 / 3`)
 *
 * @param {Object} node root expression. One of:
 *  BinaryExpression
 *  LogicalExpression
 *  AssignmentExpression
 * @param {Object} child right or left node
 */

function needParentheses(node, child) {
    if (!MAY_NEED_PARENTHESES[child.type]) {
        return false;
    }

    var parentOp = node.operator;
    var childOp = child.operator;

    return hasPrecedence(parentOp, childOp);
}

/**
 * Return true if the first operator has precedence over the second
 *  hasPrecedence('/', '+') => true
 *
 * @param {String} op1
 * @param {String} op2
 */
function hasPrecedence(op1, op2) {
    if (!PRECEDENCE[op1] || !PRECEDENCE[op2]) {
        throw new Error(['Missing precedence number for ', JSON.stringify(op1), ' or ', JSON.stringify(op2), '. See `let PRECEDENCE`'].join(''));
    }

    return PRECEDENCE[op1] < PRECEDENCE[op2];
}

/**
 * '12 + 3' => '(12 + 3)'
 */

function wrapInParantheses(str) {
    return '(' + str + ')';
}
},{}],75:[function(require,module,exports){
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}

},{}]},{},[1]);
