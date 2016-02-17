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

// input: object destructuring with renaming
// skip
let {a: b} = c;
// output:
let {a: b} = c;

// input: comma operator
let a = () => {
    let x = 0;

    return (x += 10, x);
};
// output:
let a = () => {
    let x = 0;

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

// input: debugger
debugger;
// output:
debugger;

// input: label
// skip
loop1:
for (i = 0; i < 3; i++) {
   loop2:
   for (j = 0; j < 3; j++) {
      if (i === 1 && j === 1) {
         continue loop1;
      }
      console.log("i = " + i + ", j = " + j);
   }
}
// output:
loop1:
for (i = 0; i < 3; i++) {
   loop2:
   for (j = 0; j < 3; j++) {
      if (i === 1 && j === 1) {
         continue loop1;
      }
      console.log("i = " + i + ", j = " + j);
   }
}
