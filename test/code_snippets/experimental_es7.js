/* eslint-disable */

// input: new.target
// skip
function a() {
    console.log(new.target);
}
// output:
function a() {
    console.log(new.target);
}

// input: spread operator
// skip
let a = {
    ...b,
    c
};

[...(Array(5))];

function b(...c) {

}

a(...props);
// output:
let a = {
    ...b,
    c
};

[...(Array(5))];

function b(...c) {

}

a(...props);
