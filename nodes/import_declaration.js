/**
 *  {
 *      type: 'ImportDeclaration',
 *      specifiers: [{
 *          type: 'ImportDefaultSpecifier',
 *          local: [Object]
 *      }],
 *      source: {
 *          type: 'Literal',
 *          value: 'a',
 *          raw: '\'a\''
 *      }
 *  }
 */

export function format(node, context, recur) {
    // console.log(node);
    let specs = {
        ImportDefaultSpecifier: null,
        ImportSpecifier: [],
        ImportNamespaceSpecifier: null
    };

    let result = 'import ';

    node.specifiers.forEach((spec) => {
        switch (spec.type) {
            case 'ImportSpecifier':
                specs.ImportSpecifier.push(spec); // {a} or {b as c}
                break;
            case 'ImportDefaultSpecifier':
                specs.ImportDefaultSpecifier = spec; // import A from 'a';
                break;
            case 'ImportNamespaceSpecifier':
                specs.ImportNamespaceSpecifier = spec; // import * as e from 'a';
                break;
        }
    });

    if (specs.ImportNamespaceSpecifier) {
        result += recur(specs.ImportNamespaceSpecifier);
    }

    if (specs.ImportDefaultSpecifier) {
        result += recur(specs.ImportDefaultSpecifier);

        if (specs.ImportSpecifier.length) {
            result += ', ';
        }
    }

    if (specs.ImportSpecifier.length) {
        result += '{' + specs.ImportSpecifier.map(recur).join(', ') + '}';
    }

    return result += ' from ' + recur(node.source);
}
