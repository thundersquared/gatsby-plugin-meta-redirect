[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

# gatsby-plugin-htaccess-redirect

Generates meta redirect html files for redirecting on any static file host.

## Install

```sh
npm install --save gatsby-plugin-htaccess-redirect
```

or

```sh
yarn add gatsby-plugin-htaccess-redirect
```

## How to use

```js
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-htaccess-redirect` // make sure to put last in the array
];
```

### Redirects

You can create redirects using the [`createRedirect`](https://www.gatsbyjs.org/docs/bound-action-creators/#createRedirect) action.

An example:

```js
createRedirect({ fromPath: '/old-url', toPath: '/new-url', isPermanent: true });
createRedirect({ fromPath: '/url', toPath: '/zn-CH/url', Language: 'zn' });
```

That will generate the following html files:

### `/old-url/index.html`:

```html
<meta http-equiv="refresh" content="0; URL='/new-url/'" />
```

and

### `/url/index.html`:

```html
<meta http-equiv="refresh" content="0; URL='/zn-CH/url/'" />
```

[build-badge]: https://img.shields.io/travis/getchalk/gatsby-plugin-htaccess-redirect/master.png?style=flat-square
[build]: https://travis-ci.org/getchalk/gatsby-plugin-htaccess-redirect
[npm-badge]: https://img.shields.io/npm/v/gatsby-plugin-htaccess-redirect.png?style=flat-square
[npm]: https://www.npmjs.org/package/gatsby-plugin-htaccess-redirect
