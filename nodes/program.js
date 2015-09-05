export default class Program {
    constructor(esprimaNode, create) {
        this.node = esprimaNode;
        this.children = this.node.body.map(create);
    }

    toString() {
        return this.children.map((child) => child.toString()).join('\n');
    }
};
