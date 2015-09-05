export default class Identifier {
    constructor(esprimaNode, create) {
        this.node = esprimaNode;
        this.name = this.node.name;
    }

    toString() {
        return this.name;
    }
};
