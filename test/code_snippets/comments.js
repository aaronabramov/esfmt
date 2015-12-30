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
