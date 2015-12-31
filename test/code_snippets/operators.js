/* eslint-disable */

// input: unary
void(0);
i++;
i--;
++i;
--i;
typeof i;
delete a.b;
+a;
-a;
~a;
!a;
// output:
void(0);
i++;
i--;
++i;
--i;
typeof i;
delete a.b;
+a;
-a;
~a;
!a;

// input: relational
'a' in b;
a < b;
a > b;
a <= b;
a >= b;
a instanceof b;
// output:
'a' in b;
a < b;
a > b;
a <= b;
a >= b;
a instanceof b;

// input: equality
a === b;
a == b;
a != b;
a !== b;
// output:
a === b;
a == b;
a != b;
a !== b;

// input: bitwise shift
a << 5;
a >> 1;
a >>> 19;
// output:
a << 5;
a >> 1;
a >>> 19;

// input: binary
b | c | d;
a | b ^ c & d;
// output:
b | c | d;
a | b ^ c & d;

// input: binary logical
a || b;
a && b || c;
// output:
a || b;
a && b || c;

// input: ternary
a ? b : c;
a ? b ? c : d : e;
// output:
a ? b : c;
a ? b ? c : d : e;

// input: assignment
a = b;
a *= b;
a /= b;
a %= b;
a += b;
a -= b;
a <<= b;
a >>= b;
a >>>= b;
a &= b;
a ^= b;
a |= b;
// output:
a = b;
a *= b;
a /= b;
a %= b;
a += b;
a -= b;
a <<= b;
a >>= b;
a >>>= b;
a &= b;
a ^= b;
a |= b;

// input: array destructuring assignemnt
let [a, b] = [c, d];
// output:
let [a, b] = [c, d];

// input: object destructuring assignemnt
// skip
let {a, b} = {a: 1, b: 2};
// output:
let {a, b} = {a: 1, b: 2};

// input: comma operator
// skip
let a = () => {
    let x = 0

    return (x += 10, x);
};
// output:
let a = () => {
    let x = 0

    return (x += 10, x);
};

// input: arithmetic
a + b;
a - b;
a * b;
a / b;
a % b;
// output:
a + b;
a - b;
a * b;
a / b;
a % b;

// input: rest
function abc(a, ...b) {
    return b;
}
// output:
function abc(a, ...b) {
    return b;
}
