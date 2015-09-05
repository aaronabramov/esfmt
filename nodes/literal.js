export default class Literal {
    constructor(esprimaNode, create) {
        this.node = esprimaNode;
        this.value = this.node.value;
        this.raw = this.node.raw;
    }

    toString() {
        return this.raw;
    }
};
