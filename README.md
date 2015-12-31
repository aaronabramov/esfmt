[![Build Status](https://travis-ci.org/dmitriiabramov/esfmt.svg?branch=master)](https://travis-ci.org/dmitriiabramov/esfmt)
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

#### Testing
Most of the testing is done by formatting code snippets and matching resulting output with expected string value.

Code snippet files are located at `test/code_snippets/*.js`

The DSL has the following format

```js
// input: test case description (e.g. variable declaration)
let a        =         5;
// output:
let a = 5;
```

this will produce a test case that will look like this:
```
code snippets
    ✓ code_snippets_filename: test case description (e.g. variable declaration)
```

if any specific test needs to be whitelisted (mocha it.only) or blacklisted (mocha it.skip) skip or only line can be added after the test description
```js
// input: arrays
// skip
[1, 'a', null];
// output:
[1, 'a', null];
```

or

```js
// input: arrays
// only
[1, 'a', null];
// output:
[1, 'a', null];
```

in addition to that, if any specific configuration values need to be used for the test, they can be passed using a config line `// config: {"settingName": "value"}`

Note that the values should be provided in JSON format (meaning double quotes around the keys)
```js
// input: arrays
// only
// config: {"max-len": 5}
[1, 'a', null];
// output:
[1, 'a', null];
```


#### TODO
- CLI
- comments in
    - class definitions
    - arguments (lists)
