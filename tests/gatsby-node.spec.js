const {exists, remove, readFile} = require('fs-extra');
const {getRewriteRule, onPostBuild} = require('../gatsby-node');

describe('getRewriteRule', () => {
    it('wraps path in forward slashes', () => {
        expect(getRewriteRule('', 'toPath')).toMatchSnapshot();
    });

    it('allows existing leading and trailing forward slashes', () => {
        expect(getRewriteRule('', '/toPath/')).toMatchSnapshot();
    });

    it('trims leading and trailing whitespace', () => {
        expect(getRewriteRule('', ' toPath ')).toMatchSnapshot();
    });

    it('handles deep paths', () => {
        expect(getRewriteRule('', 'a/b/c/d')).toMatchSnapshot();
    });

    it('handles offset wrapping forward slashes', () => {
        expect(getRewriteRule('', 'a/b/c/')).toMatchSnapshot();
    });

    it('replaces duplicate slashes with single slash', () => {
        expect(getRewriteRule('', 'topath//a')).toMatchSnapshot();
    });

    it('leaves full urls untouched', () => {
        expect(getRewriteRule('', 'http://example.com')).toMatchSnapshot();
        expect(getRewriteRule('', 'http://example.com/')).toMatchSnapshot();
        expect(getRewriteRule('', 'http://example.com/a/b/c')).toMatchSnapshot();
    });

    it('handles redirecting to root', () => {
        expect(getRewriteRule('', '/')).toMatchSnapshot();
    });

    it('handles redirecting to a file', () => {
        expect(getRewriteRule('', '/test.txt')).toMatchSnapshot();
    });

    it('handles redirecting to a file in a folder', () => {
        expect(getRewriteRule('', 'a/b/test.txt')).toMatchSnapshot();
    });
});

describe('onPostBuild', () => {
    const tempFolderPath = './public';

    const assertRedirectFile = async (redirects) => {
        await onPostBuild({
            store: {
                getState: () => ({
                    redirects,
                    program: {
                        directory: './'
                    }
                })
            }
        });

        expect(await exists(`${tempFolderPath}/.htaccess`)).toBe(true);
        expect(await readFile(`${tempFolderPath}/.htaccess`, 'utf-8')).toMatchSnapshot();
    };

    beforeEach(async () => {
        await remove(tempFolderPath);
    });

    // cleanup
    afterAll(async () => {
        await remove(tempFolderPath);
    });

    it('writes redirects from root', async () => {
        await assertRedirectFile(
            [
                {
                    fromPath: '/',
                    toPath: '/hello'
                }
            ],
        );
    });

    it('writes redirects to root', async () => {
        await assertRedirectFile(
            [
                {
                    fromPath: '/hello',
                    toPath: '/'
                }
            ],
        );
    });

    it('writes deep path redirects', async () => {
        await assertRedirectFile(
            [
                {
                    fromPath: '/a/b/c/d',
                    toPath: '/x/y/z'
                }
            ],
        );
    });

    it('handles external redirects', async () => {
        await assertRedirectFile(
            [
                {
                    fromPath: '/a/b',
                    toPath: 'http://example.com/'
                }
            ],
        );
    });
});
