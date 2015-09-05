import esprima from 'espree';
import esprimaOptions from './esprima_options';
import nodeFactory from './node_factory';


export function format(code) {
    const ast = esprima.parse(code, esprimaOptions);

    console.log('AST: \n', JSON.stringify(ast, null, 2));

    const node = nodeFactory(ast);
    return node.toString();
};
