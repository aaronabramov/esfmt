/* eslint-disable */

// input: array destructuring
let [a,  b] = [1, 2 ]
// output:
let [a, b] = [1, 2];

// input: indentation
// config: {"indentation": 3}
function a() { return 5}
// output:
function a() {
   return 5;
}

// input: unary operators
void(0);
i++;
i--;
++i;
--i;
typeof i;
// output:
void(0);
i++;
i--;
++i;
--i;
typeof i;

// input: binary operators
a || b;
b | c | d;
a | b ^ c & d;
a && b || c;

// output:
a || b;
b | c | d;
a | b ^ c & d;
a && b || c;

// input: strings
'abc';
`abc`;
`${a} abc`;
`${abc} abc ${cde}`;
`
a
${b}
`;
// output:
'abc';
`abc`;
`${a} abc`;
`${abc} abc ${cde}`;
`
a
${b}
`;

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

// input: object declaration
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

// input: variable declarations
var a;
var a = 5;
var a, b;
var a, b = 5, c;
const a = 5;
let b;
// output:
var a;
var a = 5;
var a,
    b;
var a,
    b = 5,
    c;
const a = 5;
let b;

// input: grouping (paratheses)
(1 + 2) / 3;
1 / (2 + 3);
(1 + 2) / (3 + 4);
a || (a = 4);
if (!n) {};
a * (b + c);
// output:
(1 + 2) / 3;
1 / (2 + 3);
(1 + 2) / (3 + 4);
a || (a = 4);
if (!n) {}
a * (b + c);

// input: functions
fn(a, 5);
function abc(a, b) {
    return b;
}

let a = function() {
    return c;
};

let b = () => {
    return;
};

new A();
// output:
fn(a, 5);

function abc(a, b) {
    return b;
}

let a = function() {
    return c;
};
let b = () => {
    return;
};

new A();

// input: deeply nested blocks
a.b.c.d(function(f) {
    return void(0);
}, setTimeout(function() {
    const bb = function() {
        return function() {
            return function() {};
        };
    };
}, 100));
// output:
a.b.c.d(function(f) {
    return void(0);
}, setTimeout(function() {
    const bb = function() {
        return function() {
            return function() {};
        };
    };
}, 100));

// input: array
[1, 'b', null, undefined, NaN, Infinity, 0, -1];
// output:
[1, 'b', null, undefined, NaN, Infinity, 0, -1];

// input: empty statement
function a() {};;;;
// output:
function a() {}

// input: literals
[1, 2];
true;
false;
0;
0x123;
0x00001;
0xF1A7;
0b11;
0b0001;
-0b10;
3.14;
-.134;
-4.9E+12;
.1e-23;
'abc';
"abc";
undefined;
null;
NaN;
Infinity;
-Infinity;
/^abc[\s\w]+(a|b|c).?a+$/gmi;
// output:
[1, 2];
true;
false;
0;
0x123;
0x00001;
0xF1A7;
0b11;
0b0001;
-0b10;
3.14;
-.134;
-4.9E+12;
.1e-23;
'abc';
"abc";
undefined;
null;
NaN;
Infinity;
-Infinity;
/^abc[\s\w]+(a|b|c).?a+$/gmi;
