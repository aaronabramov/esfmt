import {format} from '../esfmt';
import {expect} from 'chai';

describe.skip('formatting of React.js .jsx files', function() {
    specify('formats jsx tags', function() {
        const code =
`const a =function() {
    return (
        <div className="abc">
            <span>abc {test}</span>
            <Test />
        </div>
    );
}`;

        expect(format(code)).to.equal(
`const a = function() {
    return <div className="abc">
        <span>abc {test}</span>
        <Test />
    </div>
}`);
    });
});
