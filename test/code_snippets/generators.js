/* eslint-disable */

// input: definition
const g = function* () {
    yield 1;
    yield 2;
};
let gg = g();

console.log(g.next().value);
// output:
const g = function* () {
    yield 1;
    yield 2;
};
let gg = g();

console.log(g.next().value);

// input: deletating yield
// skip
function* g2() {
    yield 1;
    yield* g();
    yield 2;
}
// output:
function* g2() {
    yield 1;
    yield* g();
    yield 2;
}
