/* eslint-disable */

// input: trailing line comments
let a; // stuff
const b = {
    a: 5, // yo
    b: 0 // yo yo yo
}; // lol
// end
// output:
let a; // stuff
const b = {
    a: 5, // yo
    b: 0 // yo yo yo
}; // lol
// end

// input: leading line comments
// yo yo yo
function abc() {
    // dude
    return b;
}

// lol
var obj = {
    // property
    a: b
};
// output:
// yo yo yo
function abc() {
    // dude
    return b;
}

// lol
var obj = {
    // property
    a: b
};


// input: block comments
/*
abc
*/
function a() {
    /* abc */
    return {
        /* bc
         * e
         */
         a: 5
         /* b
         */
    } /* abc */
    /*ced*/
} /* a */
/* b */
// output:
/*
abc
*/
function a() {
    /* abc */
    return {
        /* bc
         * e
         */
        a: 5
        /* b
         */
    };
    /* abc */
    /*ced*/
} /* a */
/* b */


// input: mixed comments
/* abc */
/// abc
function a() {
    // re
    /* er */
    return b;
} // b
/* c */

// output:
/* abc */
/// abc
function a() {
    // re
    /* er */
    return b;
} // b
/* c */

// input: in classes
// skip
/* abc */
class A { // cde
    /* abc */
    constructor() { // d
        super(); // a
    } // l

    // oeu
    method() {
        return 5; // b
    } // abc
    // cde
} // ath
// oeu
// output:
/* abc */
class A { // cde
    /* abc */
    constructor() { // d
        super(); // a
    } // l

    // oeu
    method() {
        return 5; // b
    } // abc
    // cde
} // ath
// oeu

// input: in arrays
// skip
[a, /* b */ c /* d */]; // abc
// output:
[a, /* b */ c /* d */]; // abc

// input: in function argument list
// skip
function a(a, /* b */ c /* rest */) {}
a(a, /* b */ c /* rest */);
// output:
function a(a, /* b */ c /* rest */) {}

a(a, /* b */ c /* rest */);

// input: in objects
let a = {
    /* b */
    a: function() {}, // cde
    // abc
    b: 'test test test' // abc
    // a
}; // a
// b
// output:
let a = {
    /* b */
    a: function() {}, // cde
    // abc
    b: 'test test test' // abc
    // a
}; // a
// b

// input: trailing comment on the first line
// skip
const a = { // abc
    b
};
// output:
const a = { // abc
    b
};

// input: trailing comment on the last line without ';'
// skip
const a = {
    b
} // a
// b
// output:
const a = {
    b
}; // a
// b

// input: in variable declaration blocks
// skip
// aaaa
let a = 5, // acb
    // aaa
    b = 5; // ddd
// output:
// aaaa
let a = 5, // acb
    // aaa
    b = 5; // ddd

// input: in multiline arrays
// skip
// config: {"max-len": 5}
let a = [ // bbb
    1, // cccc
    2, // ddd
    /* 234'4 */
    3
    // abc
] // 999
// 888
// output:
let a = [ // bbb
    1, // cccc
    2, // ddd
    /* 234'4 */
    3
    // abc
] // 999
// 888
