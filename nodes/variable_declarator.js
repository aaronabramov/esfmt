export default class VariableDeclarator {
    constructor(esprimaNode, create) {
        this.node = esprimaNode;
        this.id = create(this.node.id);
        this.init = create(this.node.init);
    }

    toString() {
        return `${this.id.toString()} = ${this.init.toString()}`;
    }
};
