// { type: 'TemplateElement',
//   value: { raw: 'abc ', cooked: 'abc ' },
//   tail: false,
//   range: [ 0, 7 ],
//   loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } } }
export function format(node, context) {
    context.write(node.value.raw);
}
