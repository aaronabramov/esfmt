/* eslint-disable */

// input: miltiline arrays
let a = [aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb, ccccccccccccccccccccccccccccccccc, ddddddddddddddd];
// output:
let a = [
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb,
    ccccccccccccccccccccccccccccccccc,
    ddddddddddddddd
];

// input: binary expressions
// config: {"max-len": 50}
aaaaaaaa || bbbbbbbbbbbbb && ccccccccccccc | ddddddddddddddd;
// output:
aaaaaaaa || bbbbbbbbbbbbb && ccccccccccccc |
        ddddddddddddddd;

// input: grouping
// config: {"max-len": 30}
aaaaaaaaaaaaaaaaaaaaaaa | (bbbbbbbbbbbbbbbbbbbbbb || cccccccccccccccccc);
// output:
aaaaaaaaaaaaaaaaaaaaaaa |
        (bbbbbbbbbbbbbbbbbbbbbb ||
        cccccccccccccccccc);
