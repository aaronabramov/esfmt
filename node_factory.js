import Program from './nodes/program';
import VariableDeclaration from './nodes/variable_declaration';
import VariableDeclarator from './nodes/variable_declarator';
import Literal from './nodes/literal';
import Identifier from './nodes/identifier';

const NODE_TYPES = {
    Program: Program,
    VariableDeclaration: VariableDeclaration,
    VariableDeclarator: VariableDeclarator,
    Literal: Literal,
    Identifier: Identifier
};

function create(esprimaNode) {
    const Ctr = NODE_TYPES[esprimaNode.type];

    if (!Ctr) {
        throw new Error('unknown node type: ' + esprimaNode.type);
    }

    return new Ctr(esprimaNode, create);
}


export default create;
