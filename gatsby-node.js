const path = require('path');
const {exists, writeFile, ensureDir} = require('fs-extra');

/**
 * Create single RewriteRule to be added into the .htaccess file
 * @param fromPath Source path
 * @param toPath Destination path or URL
 * @param pathPrefix Site base path or RewriteBase
 * @returns {string} Wrapped and final RewriteRule
 */
const getRewriteRule = (fromPath, toPath, pathPrefix) => {
    let url = toPath.trim();

    const hasProtocol = url.includes(`://`);

    if (!hasProtocol) {
        const hasLeadingSlash = url.startsWith(`/`);

        if (!hasLeadingSlash) {
            url = `/${url}`;
        }

        if (pathPrefix.length > 0) {
            url = `${pathPrefix}${url}`;
        }

        const resemblesFile = url.includes('.');

        if (!resemblesFile) {
            url = `${url}/`.replace(/\/\/+/g, '/');
        }
    }

    return `RewriteRule ^/?${fromPath}/?$ ${url} [R=301,L]`;
};

/**
 * Build .htaccess module structure and rewrite rules
 * @param redirects List of redirects to be processed
 * @param folder Destination folder for the .htaccess to be placed in
 * @param pathPrefix Site base path, which be be also used as RewriteBase
 * @returns {Promise<void>}
 */
async function writeHtaccessFile(redirects, folder, pathPrefix) {
    if (!redirects.length) {
        return;
    }

    let outputLines = [];

    outputLines.push(`<IfModule mod_rewrite.c>`);
    outputLines.push(`RewriteEngine On`);

    if (pathPrefix.length > 0) {
        outputLines.push(`RewriteBase ${pathPrefix}`);
    }

    for (const redirect of redirects) {
        const {fromPath, toPath} = redirect;
        outputLines.push(getRewriteRule(fromPath, toPath, pathPrefix));
    }

    outputLines.push(`</IfModule>`);

    const FILE_PATH = path.join(
        folder,
        `.htaccess`
    );

    const fileExists = await exists(FILE_PATH);

    if (!fileExists) {
        try {
            await ensureDir(path.dirname(FILE_PATH));
        } catch (err) {
            // ignore if the directory already exists;
        }
    }

    await writeFile(FILE_PATH, outputLines.join(`\n`));
}

/**
 * Gatsby hook to perform .htaccess creation post build
 * @param store Current site state and settings
 * @returns {Promise<void>}
 */
exports.onPostBuild = ({store}) => {
    const {redirects, program, config} = store.getState();

    let pathPrefix = ``;

    if (program.prefixPaths) {
        pathPrefix = config.pathPrefix;
    }

    const folder = path.join(program.directory, `public`);

    return writeHtaccessFile(redirects, folder, pathPrefix);
};
