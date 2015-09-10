/**
 *  {
 *      type: 'ExportDefaultDeclaration',
 *      declaration: {
 *          type: 'Identifier',
 *          name: 'A',
 *          range: [15, 16],
 *          loc: {
 *              start: [Object],
 *              end: [Object]
 *          }
 *      },
 *      range: [0, 16],
 *      loc: {
 *          start: {
 *              line: 1,
 *              column: 0
 *          },
 *          end: {
 *              line: 1,
 *              column: 16
 *          }
 *      }
 *  }
 */
export function format(node, context, recur) {
    context.write('export default ');
    recur(node.declaration);
}
