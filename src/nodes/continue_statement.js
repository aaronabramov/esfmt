// { type: 'ContinueStatement',
//   label: null,
//   range: [ 18, 27 ],
//   loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 13 } } }
export function format(node, context) {
    context.write('continue');
}
