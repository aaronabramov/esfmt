import {format} from '../esfmt';
import {expect} from 'chai';

describe('formatting of React.js .jsx files', function() {
    specify('<br />', function() {
        const code = '<br />';

        expect(format(code)).to.equal('<br />;');
    });

    specify('<div></div>', function() {
        const code = '<div></div>';

        expect(format(code)).to.equal('<div></div>;');
    });

    specify('<App a="b" />', function() {
        const code = '<App a="b"/>';

        expect(format(code)).to.equal('<App a="b" />;');
    });

    specify('<div a="b"></div>', function() {
        const code = '<div a="b"></div>';

        expect(format(code)).to.equal('<div a="b"></div>;');
    });

    specify('nested elements', function() {
        const code = '<div><span /></div>';

        expect(format(code)).to.equal(
`<div>
    <span />
</div>;`);
    });

    specify('nested text', function() {
        const code = '<div>abc</div>';

        expect(format(code)).to.equal(
`<div>
    abc
</div>;`);
    });

    specify('expression container', function() {
        const code = '<div a={123}></div>';

        expect(format(code)).to.equal('<div a={123}></div>;');
    });

    specify('child expression container', function() {
        const code = '<div>{234}</div>';

        expect(format(code)).to.equal(
`<div>
    {234}
</div>;`);
    });

    specify('container and a string', function() {
        const code = '<div>abc {123} cde</div>';

        expect(format(code)).to.equal(
`<div>
    abc {123} cde
</div>;`);
    });

    specify.skip('formats jsx tags', function() {
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
