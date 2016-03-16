/* eslint-disable */

// input: tags
<b  />;
<Module />;
<Abc>
    <br />
</Abc>
// output:
<b />;
<Module />;
<Abc>
    <br />
</Abc>;

// input: props
<component a="b" c={5} />;
// output:
<component a="b" c={5} />;

// input: content
<a>abc</a>;
// output:
<a>
    abc
</a>;

// input: mixed code
<a />;
a = 5;
<b />;
// output:
<a />;
a = 5;
<b />;

// input: in a function
function render() {
    return <Component>
        <child />
        'string'
        <child />
        <child />
    </Component>;
}
// output:
function render() {
    return <Component>
        <child />
        'string'
        <child />
        <child />
    </Component>;
}

// input: no children
<a></a>
// output:
<a></a>;
