[![Build Status](https://travis-ci.org/dmitriiabramov/esfmt.svg)](https://travis-ci.org/dmitriiabramov/esfmt)
[![codecov.io](http://codecov.io/github/dmitriiabramov/esfmt/coverage.svg?branch=master)](http://codecov.io/github/dmitriiabramov/esfmt?branch=master)


esfmt formats (beautifies, pretty-prints) javascript (es6, jsx) code.


## Install
```
npm install -g esfmt
```

## CLI
```
Usage:
   esfmt [flags] [files ...]

Options:
   -w          | overwrite contents of the files with formatted version
   --help      | print this text
   --version   | print esfmt version

Without an explicit path, esfmt will process stdin and print results to stdout
```


## Example
```js
// echo 'if((a + b) * 4){return (e) => { return a.b.c(<Component a="5" b={[1, b, 0]}><br /></Component>)}} else { return {a: 5, b: 8, c: 9} }' | ./bin/esfmt
if ((a + b) * 4) {
    return (e) => {
        return a.b.c(<Component a="5" b={[1, b, 0]}>
            <br />
        </Component>);
    };
} else {
    return {
        a: 5,
        b: 8,
        c: 9
    };
}
```

#### TODO
- comments in
    - class definitions
    - arguments (lists)

- nodes
    - string templates
    - array pattern (parenthesis)
    - computed keys

- linebreaks after
    - multiline statements
    - where a linebreak was in the original code

- semicolons
    - not after exporting a function

- linewrapping
    - only check overflow after a certain ponit (not the beginning of the file)
    - oneline objects, arrays
