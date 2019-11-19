# awensys-ext-webpack-plugin

A [Webpack](https://webpack.js.org/) plugin for [Sencha EXTJS](https://www.sencha.com/products/extjs) applications to watch the file changes during development.

This plugin enhances the Sencha ext-webpack-plugin:

* prevent hotreload in webpack-dev-server client
* take into account --uses build option
* enhance console log for packages building

## Installation (Manually)

Install [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

Install from git repository
```bash
npm install https://github.com/agilium/awensys-ext-webpack-plugin
```
## Installation (package.json)
  Replaces  @sencha/ext-webpack-plugin

  ```js
     "devDependencies": {
        "@agilium/agilium-ext-webpack-plugin": "git+https://github.com/agilium/agilium-ext-webpack-plugin.git",
  ```

## Usage

In your webpack configuration (webpack.config.js), 

```js
const ExtWebpackPlugin = require('@agilium/awensys-ext-webpack-plugin');

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


## Compilation

  Compile/build sources in  ``/dist`` folder
  
  See ``package.json``
  
  ```
    "main": "dist/index.js",
    "name": "@awensys/awensys-ext-webpack-plugin",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/agilium/awensys-ext-webpack-plugin.git"
    },
    "scripts": {
      "build": "npx babel ./src --out-dir ./dist"
    },
  ```
  
  Command
  ```
      npm run build
      or
      npx babel ./src --out-dir ./dist
  ``` 
  
  If the following error occurs launch `npm install --save-dev @babel/core @babel/cli `
   ```
       You have mistakenly installed the `babel` package, which is a no-op in Babel 6.
       Babel's CLI commands have been moved from the `babel` package to the `babel-cli` package.
        npm uninstall babel
        npm install --save-dev babel-cli
        See http://babeljs.io/docs/usage/cli/ for setup instructions.
   ```

