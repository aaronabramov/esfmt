/* eslint-disable */

// input: import
import a from 'b';
import {a} from 'c';
import a, {b} from 'd';
import * as a from 'e';
import {b as c} from 'f';
// output:
import a from 'b';
import {a} from 'c';
import a, {b} from 'd';
import * as a from 'e';
import {b as c} from 'f';

// input: export
export default b;
export function b() {};
export const a = 5;
export let b = 6;
export {b as c, d};
// output:
export default b;
export function b() {};
export const a = 5;
export let b = 6;
export {b as c, d};
