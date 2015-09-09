[![Build Status](https://travis-ci.org/dmitriiabramov/esfmt.svg)](https://travis-ci.org/dmitriiabramov/esfmt)
[![codecov.io](http://codecov.io/github/dmitriiabramov/esfmt/coverage.svg?branch=master)](http://codecov.io/github/dmitriiabramov/esfmt?branch=master)

My attempt to parse javascript into AST and write it back


```js
specify('nested ifs', function() {
    const code = `if (a = 5) { if (null) { return '555' } else {
        if (a) null; } } else { return undefined; }`;

    expect(format(code)).to.equal(
`if (a = 5) {
    if (null) {
        return '555';
    } else {
        if (a) {
            null;
        }
    }
} else {
    return undefined;
}`);
});
```
