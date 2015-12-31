/* eslint-disable */

// input: for
for (let i = 0; i < b; i++) {
    break;
}
// output:
for (let i = 0; i < b; i++) {
    break;
}

// input: do...while
do {
    a++;
    continue;
} while (true);
// output:
do {
    a++;
    continue;
} while (true);


// input: while
// skip
while (false) {
    break;
}
// output:
while (false) {
    break;
}

// input: for...of
// skip
for (let i of b) {
    console.log(i);
}
// output:
for (let i of b) {
    console.log(i);
}

// input: for...in
for (let i in b) {
    console.log(i);
}
// output:
for (let i in b) {
    console.log(i);
}

// input: infinite (empty) for
// skip
for (;;) {
    a++;
}
// output:
for (;;) {
    a++;
}
