# agilium-ext-webpack-plugin

A [Webpack](https://webpack.js.org/) plugin for [Sencha EXTJS](https://www.sencha.com/products/extjs) applications to watch the file changes during development.

This plugin enhances the Sencha ext-webpack-plugin:

* prevent hotreload in webpack-dev-server client
* take into account --uses build option
* enhance console log for packages building

## Installation

Install [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

Install from git repository
```bash
npm install https://github.com/agilium/agilium-ext-webpack-plugin
```

## Usage

In your webpack configuration, 

```js
const ExtWebpackPlugin = require('@agilium/agilium-ext-webpack-plugin');

...

module.exports = function (env) {
  return {
    ...

    plugins: [
      new ExtWebpackPlugin
      ...
    ]
  }
}

```

This will be included in your webpack configuration if you generate the application using [@sencha/ext-gen](https://github.com/sencha/ext-gen/tree/2.0.x-dev/packages/ext-gen)
