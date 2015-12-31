/* eslint-disable */

// input: definition
class A {
    constructor() {
        super();
    }

    method() {

    }
}

class B extends A {
    method2(abc) {

    }
}
// output:
class A {
    constructor() {
        super();
    }

    method() {}
}

class B extends A {
    method2(abc) {}
}

// input: static methods
class A {
    static a(b) {
        return test;
    }
}
// output:
class A {
    static a(b) {
        return test;
    }
}

// input: getters
class _ {
    get a() {
        return 5;
    }

    set b(a) {
        return 8;
    }
}
// output:
class _ {
    get a() {
        return 5;
    }

    set b(a) {
        return 8;
    }
}
