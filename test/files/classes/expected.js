class ABC extends React.Component {
    constructor(a) {
        this.a = a;
    }

    static st(a, b) {
        return a + b;
    }

    get prop() {
        return this._prop();
    }

    set prop(value) {
        return this._prop();
    }

    myMethod() {}
}
