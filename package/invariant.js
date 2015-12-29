"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = invariant;function invariant(condition, message) {
    if (!condition) {
        throw new Error(message);}}module.exports = exports["default"];