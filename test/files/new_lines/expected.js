import a from 'a';
import b from 'b';

a = b;

function abc() {
    return null;
}

a.b.c = function() {
    return 4;
};

b = c;
a + function() {
    return 2;
};

c = d;
