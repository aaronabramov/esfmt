/* eslint-disable */


// input: property access
a['a'];
a[a];
a[b()];
a[b[c[0]]];
'abc'[1];
// output:
a['a'];
a[a];
a[b()];
a[b[c[0]]];
'abc'[1];

// input: declaration
let a = {
    b: function() {
        return c;
    },
    c: a.b.c.d.e.f,
    d: 1,
    e: 'abc',
    f: this,
    [a]: undefined
};
// output:
let a = {
    b: function() {
        return c;
    },
    c: a.b.c.d.e.f,
    d: 1,
    e: 'abc',
    f: this,
    [a]: undefined
};

// input: destructuring
// skip
let a = {b, c, d};
// output:
let a = {b, c, d};

// input: one line objects
// skip
let a = {a: 1, b: 2};
// output:
let a = {a: 1, b: 2};
