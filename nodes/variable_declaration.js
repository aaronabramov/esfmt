export default class VariableDeclaration {
    constructor(esprimaNode, create) {
        this.node = esprimaNode;
        this.declarations = this.node.declarations.map(create);
    }

    toString() {
        const declarations = this.declarations.map((declaration) => {
            return declaration.toString()
        });

        return `var ${declarations.join(', ')};`;
    }
};
