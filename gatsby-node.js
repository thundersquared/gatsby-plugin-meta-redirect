const path = require('path');
const { exists, writeFile, ensureDir } = require('fs-extra');

const getMetaRedirect = require('./getMetaRedirect');

async function writeRedirectsFile(redirects, folder, pathPrefix) {
  if (!redirects.length) return;

  let outputLines = [];

  outputLines.push(`<IfModule mod_rewrite.c>`);
  outputLines.push(`RewriteEngine On`);

  for (const redirect of redirects) {
    const { fromPath, toPath } = redirect;
    console.log(fromPath, toPath);
    outputLines.push(getMetaRedirect(fromPath, toPath));
  }

  outputLines.push(`</IfModule>`);

  const FILE_PATH = path.join(
    folder,
    '.htaccess'
  );

  const fileExists = await exists(FILE_PATH);
  if (!fileExists) {
    try {
      await ensureDir(path.dirname(FILE_PATH));
    } catch (err) {
      // ignore if the directory already exists;
    }

    await writeFile(FILE_PATH, outputLines.join("\n"));
  }
}

exports.onPostBuild = ({ store }) => {
  const { redirects, program, config } = store.getState();

  let pathPrefix = '';
  if (program.prefixPaths) {
    pathPrefix = config.pathPrefix;
  }

  const folder = path.join(program.directory, 'public');
  return writeRedirectsFile(redirects, folder, pathPrefix);
};
