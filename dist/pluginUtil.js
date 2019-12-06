"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._constructor = _constructor;
exports._thisCompilation = _thisCompilation;
exports._compilation = _compilation;
exports._afterCompile = _afterCompile;
exports._emit = _emit;
exports._done = _done;
exports._prepareForBuild = _prepareForBuild;
exports._buildExtBundle = _buildExtBundle;
exports._executeAsync = _executeAsync;
exports._toXtype = _toXtype;
exports._getApp = _getApp;
exports._getVersions = _getVersions;
exports.log = log;
exports.logh = logh;
exports.logv = logv;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//**********
function _constructor(initialOptions) {
  const fs = require('fs');

  var vars = {};
  var options = {};

  try {
    if (initialOptions.framework == undefined) {
      vars.pluginErrors = [];
      vars.pluginErrors.push('webpack config: framework parameter on ext-webpack-plugin is not defined - values: react, angular, extjs, web-components');
      var result = {
        vars: vars
      };
      return result;
    }

    var framework = initialOptions.framework;
    var treeshake = initialOptions.treeshake;
    var verbose = initialOptions.verbose;

    const validateOptions = require('schema-utils');

    validateOptions(_getValidateOptions(), initialOptions, '');
    const rc = fs.existsSync(`.ext-${framework}rc`) && JSON.parse(fs.readFileSync(`.ext-${framework}rc`, 'utf-8')) || {};
    options = _objectSpread({}, _getDefaultOptions(), {}, initialOptions, {}, rc);
    vars = require(`./${framework}Util`)._getDefaultVars();
    vars.pluginName = 'ext-webpack-plugin';
    vars.app = _getApp();
    var pluginName = vars.pluginName;
    var app = vars.app;
    logv(verbose, 'FUNCTION _constructor');
    logv(verbose, `pluginName - ${pluginName}`);
    logv(verbose, `app - ${app}`);

    if (options.environment == 'production') {
      vars.production = true;
      options.browser = 'no';
      options.watch = 'no';
    } else {
      vars.production = false;
    }

    log(app, _getVersions(pluginName, framework)); //mjg added for angular cli build

    if (framework == 'angular' && options.intellishake == 'no' && vars.production == true && treeshake == 'yes') {
      vars.buildstep = '1 of 1';
      log(app, 'Starting production build for ' + framework);
    } else if (framework == 'react' || framework == 'extjs' || framework == 'web-components') {
      if (vars.production == true) {
        vars.buildstep = '1 of 1';
        log(app, 'Starting production build for ' + framework);
      } else {
        vars.buildstep = '1 of 1';
        log(app, 'Starting development build for ' + framework);
      }
    } else if (vars.production == true) {
      if (treeshake == 'yes') {
        vars.buildstep = '1 of 2';
        log(app, 'Starting production build for ' + framework + ' - ' + vars.buildstep);

        require(`./${framework}Util`)._toProd(vars, options);
      } else {
        vars.buildstep = '2 of 2';
        log(app, 'Continuing production build for ' + framework + ' - ' + vars.buildstep);
      }
    } else {
      vars.buildstep = '1 of 1';
      log(app, 'Starting development build for ' + framework);
    }
    /**
     * FDB - log options
     */


    log(app, 'Options are ' + JSON.stringify(options, null, 2));
    logv(verbose, 'Building for ' + options.environment + ', ' + 'treeshake is ' + options.treeshake + ', ' + 'intellishake is ' + options.intellishake);
    var configObj = {
      vars: vars,
      options: options
    };
    return configObj;
  } catch (e) {
    throw '_constructor: ' + e.toString();
  }
} //**********


function _thisCompilation(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    logv(verbose, 'FUNCTION _thisCompilation');
    logv(verbose, `options.script: ${options.script}`);
    logv(verbose, `buildstep: ${vars.buildstep}`);

    if (vars.buildstep === '1 of 1' || vars.buildstep === '1 of 2') {
      if (options.script != undefined && options.script != null && options.script != '') {
        log(app, `Started running ${options.script}`);
        runScript(options.script, function (err) {
          if (err) {
            throw err;
          }

          log(app, `Finished running ${options.script}`);
        });
      }
    }
  } catch (e) {
    throw '_thisCompilation: ' + e.toString();
  }
} //**********


function _compilation(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _compilation');

    if (framework != 'extjs') {
      if (options.treeshake === 'yes' && options.environment === 'production') {
        var extComponents = []; //mjg for 1 step build

        if (vars.buildstep == '1 of 1' && framework === 'angular' && options.intellishake == 'no') {
          extComponents = require(`./${framework}Util`)._getAllComponents(vars, options);
        }

        if (vars.buildstep == '1 of 2' || vars.buildstep == '1 of 1' && framework === 'web-components') {
          extComponents = require(`./${framework}Util`)._getAllComponents(vars, options);
        }

        compilation.hooks.succeedModule.tap(`ext-succeed-module`, module => {
          if (module.resource && !module.resource.match(/node_modules/)) {
            try {
              if (module.resource.match(/\.html$/) != null && module._source._value.toLowerCase().includes('doctype html') == false) {
                vars.deps = [...(vars.deps || []), ...require(`./${framework}Util`)._extractFromSource(module, options, compilation, extComponents)];
              } else {
                vars.deps = [...(vars.deps || []), ...require(`./${framework}Util`)._extractFromSource(module, options, compilation, extComponents)];
              }
            } catch (e) {
              console.log(e);
            }
          }
        });
      }

      if (vars.buildstep == '1 of 2') {
        compilation.hooks.finishModules.tap(`ext-finish-modules`, modules => {
          require(`./${framework}Util`)._writeFilesToProdFolder(vars, options);
        });
      }

      if (vars.buildstep == '1 of 1' || vars.buildstep == '2 of 2') {
        if (options.inject === 'yes') {
          compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`, data => {
            const path = require('path'); //var jsPath = path.join(vars.extPath, 'ext.js')
            //var cssPath = path.join(vars.extPath, 'ext.css')


            var jsPath = vars.extPath + '/' + 'ext.js';
            var cssPath = vars.extPath + '/' + 'ext.css';
            data.assets.js.unshift(jsPath);
            data.assets.css.unshift(cssPath);
            log(app, `Adding ${jsPath} and ${cssPath} to index.html`);
          });
        }
      }
    }
  } catch (e) {
    throw '_compilation: ' + e.toString(); //    logv(options.verbose,e)
    //    compilation.errors.push('_compilation: ' + e)
  }
} //**********


function _afterCompile(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _afterCompile');

    if (framework == 'extjs') {
      require(`./extjsUtil`)._afterCompile(compilation, vars, options);
    } else {
      logv(verbose, 'FUNCTION _afterCompile not run');
    }
  } catch (e) {
    throw '_afterCompile: ' + e.toString();
  }
} //**********


function _emit(_x, _x2, _x3, _x4, _x5) {
  return _emit2.apply(this, arguments);
} //**********


function _emit2() {
  _emit2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var path, app, verbose, emit, framework, outputPath, command, parms, x;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          path = require('path');
          app = vars.app;
          verbose = options.verbose;
          emit = options.emit;
          framework = options.framework;
          logv(verbose, 'FUNCTION _emit');

          if (!(emit == 'yes')) {
            _context.next = 35;
            break;
          }

          if (!(vars.buildstep == '1 of 1' || vars.buildstep == '1 of 2')) {
            _context.next = 31;
            break;
          }

          outputPath = path.join(compiler.outputPath, vars.extPath);

          if (compiler.outputPath === '/' && compiler.options.devServer) {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          }

          logv(verbose, 'outputPath: ' + outputPath);
          logv(verbose, 'framework: ' + framework);

          if (framework != 'extjs') {
            _prepareForBuild(app, vars, options, outputPath, compilation);
          }

          command = '';

          if (options.watch == 'yes' && vars.production == false) {
            command = 'watch';
          } else {
            command = 'build';
          }

          if (!(vars.rebuild == true)) {
            _context.next = 28;
            break;
          }

          parms = [];

          if (options.profile == undefined || options.profile == '' || options.profile == null) {
            if (command == 'build') {
              parms = ['app', command, options.environment];
            } else {
              parms = ['app', command, '--web-server', 'false', options.environment];
            }
          } else {
            if (command == 'build') {
              parms = ['app', command, options.profile, options.environment];
            } else {
              parms = ['app', command, '--web-server', 'false', options.profile, options.environment];
            }
          }
          /**
           * FDB --uses
           */


          if (options.uses === 'yes') {
            x = parms.slice(0, 2);
            x.push('--uses');
            parms = x.concat(parms.slice(2));
          }

          logv(verbose, 'BuildCmd: ' + parms.join(' '));

          if (!(vars.watchStarted == false)) {
            _context.next = 25;
            break;
          }

          _context.next = 24;
          return _buildExtBundle(app, compilation, outputPath, parms, vars, options);

        case 24:
          vars.watchStarted = true;

        case 25:
          callback();
          _context.next = 29;
          break;

        case 28:
          callback();

        case 29:
          _context.next = 33;
          break;

        case 31:
          logv(verbose, 'NOT running emit');
          callback();

        case 33:
          _context.next = 37;
          break;

        case 35:
          logv(verbose, 'emit is no');
          callback();

        case 37:
          _context.next = 43;
          break;

        case 39:
          _context.prev = 39;
          _context.t0 = _context["catch"](0);
          callback();
          throw '_emit: ' + _context.t0.toString();

        case 43:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 39]]);
  }));
  return _emit2.apply(this, arguments);
}

function _done(stats, vars, options) {
  try {
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _done');

    if (stats.compilation.errors && stats.compilation.errors.length) // && process.argv.indexOf('--watch') == -1)
      {
        var chalk = require('chalk');

        console.log(chalk.red('******************************************'));
        console.log(stats.compilation.errors[0]);
        console.log(chalk.red('******************************************'));
        process.exit(0);
      } //mjg refactor


    if (vars.production == true && options.treeshake == 'no' && framework == 'angular') {
      require(`./${options.framework}Util`)._toDev(vars, options);
    }

    try {
      if (options.browser == 'yes' && options.watch == 'yes' && vars.production == false) {
        if (vars.browserCount == 0) {
          var url = 'http://localhost:' + options.port;
          /**
           * FDB - Prevents hot reloading (see webpack-dev-server client)
           */

          if (options.hotreload === 'no') {
            url = url + '?hotreload=false';
          }

          require('./pluginUtil').log(vars.app, `Opening browser at ${url}`);

          vars.browserCount++;

          const opn = require('opn');

          opn(url);
        }
      }
    } catch (e) {
      console.log(e);
    }

    if (vars.buildstep == '1 of 1') {
      if (vars.production == true) {
        require('./pluginUtil').log(vars.app, `Ending production build for ${framework}`);
      } else {
        require('./pluginUtil').log(vars.app, `Ending development build for ${framework}`);
      }
    }

    if (vars.buildstep == '2 of 2') {
      require('./pluginUtil').log(vars.app, `Ending production build for ${framework}`);
    }
  } catch (e) {
    //    require('./pluginUtil').logv(options.verbose,e)
    throw '_done: ' + e.toString();
  }
} //**********


function _prepareForBuild(app, vars, options, output, compilation) {
  try {
    var verbose = options.verbose;
    var packages = options.packages;
    var toolkit = options.toolkit;
    var theme = options.theme;
    logv(verbose, 'FUNCTION _prepareForBuild');

    const rimraf = require('rimraf');

    const mkdirp = require('mkdirp');

    const fsx = require('fs-extra');

    const fs = require('fs');

    const path = require('path');

    theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material');
    logv(verbose, 'firstTime: ' + vars.firstTime);

    if (vars.firstTime) {
      rimraf.sync(output);
      mkdirp.sync(output);

      const buildXML = require('./artifacts').buildXML;

      const createAppJson = require('./artifacts').createAppJson;

      const createWorkspaceJson = require('./artifacts').createWorkspaceJson;

      const createJSDOMEnvironment = require('./artifacts').createJSDOMEnvironment;

      fs.writeFileSync(path.join(output, 'build.xml'), buildXML(vars.production, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(options, output), 'utf8');
      var framework = vars.framework; //because of a problem with colorpicker

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/ux/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/ux/`);
        var toPath = path.join(output, 'ux');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying (ux) ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/packages/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/packages/`);
        var toPath = path.join(output, 'packages');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/overrides/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/overrides/`);
        var toPath = path.join(output, 'overrides');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/');
        var toResources = path.join(output, '../resources');
        fsx.copySync(fromResources, toResources);
        log(app, 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
      }
    }

    vars.firstTime = false;
    var js = '';

    if (vars.production) {
      vars.deps = vars.deps.filter(function (value, index) {
        return vars.deps.indexOf(value) == index;
      });
      js = vars.deps.join(';\n');
    } else {
      js = `Ext.require(["Ext.*","Ext.data.TreeStore"])`;
    }

    if (vars.manifest === null || js !== vars.manifest) {
      vars.manifest = js + ';\nExt.require(["Ext.layout.*"]);\n';
      const manifest = path.join(output, 'manifest.js');
      fs.writeFileSync(manifest, vars.manifest, 'utf8');
      vars.rebuild = true;
      var bundleDir = output.replace(process.cwd(), '');

      if (bundleDir.trim() == '') {
        bundleDir = './';
      }

      log(app, 'Building Ext bundle at: ' + bundleDir);
    } else {
      vars.rebuild = false;
      log(app, 'Ext rebuild NOT needed');
    }
  } catch (e) {
    require('./pluginUtil').logv(options.verbose, e);

    compilation.errors.push('_prepareForBuild: ' + e);
  }
} //**********


function _buildExtBundle(app, compilation, outputPath, parms, vars, options) {
  //  try {
  var verbose = options.verbose;

  const fs = require('fs');

  logv(verbose, 'FUNCTION _buildExtBundle');
  let sencha;

  try {
    sencha = require('@sencha/cmd');
  } catch (e) {
    sencha = 'sencha';
  }

  if (fs.existsSync(sencha)) {
    logv(verbose, 'sencha folder exists');
  } else {
    logv(verbose, 'sencha folder DOES NOT exist');
  }

  return new Promise((resolve, reject) => {
    const onBuildDone = () => {
      logv(verbose, 'onBuildDone');
      resolve();
    };

    var opts = {
      cwd: outputPath,
      silent: true,
      stdio: 'pipe',
      encoding: 'utf-8'
    };

    _executeAsync(app, sencha, parms, opts, compilation, vars, options).then(function () {
      onBuildDone();
    }, function (reason) {
      reject(reason);
    });
  }); // }
  // catch(e) {
  //   console.log('e')
  //   require('./pluginUtil').logv(options.verbose,e)
  //   compilation.errors.push('_buildExtBundle: ' + e)
  //   callback()
  // }
} //**********


function _executeAsync(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
  return _executeAsync2.apply(this, arguments);
} //**********


function _executeAsync2() {
  _executeAsync2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(app, command, parms, opts, compilation, vars, options) {
    var verbose, framework, DEFAULT_SUBSTRS, substrings, chalk, pckg, buildingPackage, crossSpawn;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          //  try {
          verbose = options.verbose;
          framework = options.framework; //const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Processing', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];

          DEFAULT_SUBSTRS = ["[INF] xServer", '[INF] Loading', '[INF] Append', '[INF] Processing', '[INF] Processing Build', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          substrings = DEFAULT_SUBSTRS;
          chalk = require('chalk');
          /**
           * FDB - uses
           */

          pckg = `${chalk.blue("ℹ [pckg]: ")}`;
          buildingPackage = null;
          crossSpawn = require('cross-spawn');
          logv(verbose, 'FUNCTION _executeAsync');
          _context2.next = 11;
          return new Promise((resolve, reject) => {
            logv(verbose, `command - ${command}`);
            logv(verbose, `parms - ${parms}`);
            logv(verbose, `opts - ${JSON.stringify(opts)}`);
            let child = crossSpawn(command, parms, opts);
            child.on('close', (code, signal) => {
              logv(verbose, `on close: ` + code);

              if (code === 0) {
                resolve(0);
              } else {
                compilation.errors.push(new Error(code));
                resolve(0);
              }
            });
            child.on('error', error => {
              logv(verbose, `on error`);
              compilation.errors.push(error);
              resolve(0);
            });
            child.stdout.on('data', data => {
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              /**
               * FDB --uses - always log building package  
               */

              if (!buildingPackage && str.indexOf('[INF] Building package:') >= 0) {
                buildingPackage = str.substring(str.indexOf(':') + 1).trim();
                str = `============== Begin Building package ${buildingPackage} ==============`;
                log(pckg, str);
                return;
              }

              if (buildingPackage && str.startsWith('[INF] ==============')) {
                str = `============== End Building package ${buildingPackage} ==============`;
                buildingPackage = null;
                log(pckg, str);
                return;
              }

              logv(verbose, `${str}`);

              if (data && data.toString().match(/Fashion waiting for changes\.\.\./)) {
                // const fs = require('fs');
                // var filename = process.cwd() + vars.touchFile;
                // try {
                //   var d = new Date().toLocaleString()
                //   var data = fs.readFileSync(filename);
                //   fs.writeFileSync(filename, '//' + d, 'utf8');
                //   logv(app, `touching ${filename}`);
                // }
                // catch(e) {
                //   logv(app, `NOT touching ${filename}`);
                // }
                resolve(0);
              } else {
                if (substrings.some(function (v) {
                  return data.indexOf(v) >= 0;
                })) {
                  str = str.replace("[INF]", "");
                  str = str.replace("[LOG]", "");
                  str = str.replace(process.cwd(), '').trim();

                  if (str.includes("[ERR]")) {
                    compilation.errors.push(app + str.replace(/^\[ERR\] /gi, ''));
                    str = str.replace("[ERR]", `${chalk.red("[ERR]")}`);
                  }
                  /**
                   * FDB
                   * log(app, str)
                   */


                  log(buildingPackage ? pckg : app, str);
                }
              }
            });
            child.stderr.on('data', data => {
              logv(options, `error on close: ` + data);
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              var strJavaOpts = "Picked up _JAVA_OPTIONS";
              var includes = str.includes(strJavaOpts);
              /**
               * FDB Sometimes str is empty  
               */

              if (str && !includes) {
                if (str.toLowerCase().indexOf('warning') >= 0) {
                  /**
                   * FDB
                   */
                  if (options.verbose == 'yes') {
                    console.log(`${app} ${chalk.yellow("[WARN]")} ${str}`);
                  }
                } else {
                  console.log(`${app} ${chalk.red("[ERR]")} ${str}`);
                }
              }
            });
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _executeAsync2.apply(this, arguments);
}

function runScript(scriptPath, callback) {
  var childProcess = require('child_process'); // keep track of whether callback has been invoked to prevent multiple invocations


  var invoked = false;
  var process = childProcess.fork(scriptPath); // listen for errors as they may prevent the exit event from firing

  process.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  }); // execute the callback once the process has finished running

  process.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });
} //**********


function _toXtype(str) {
  return str.toLowerCase().replace(/_/g, '-');
} //**********


function _getApp() {
  var chalk = require('chalk');

  var prefix = ``;

  const platform = require('os').platform();

  if (platform == 'darwin') {
    prefix = `ℹ ｢ext｣:`;
  } else {
    prefix = `i [ext]:`;
  }

  return `${chalk.green(prefix)} `;
} //**********


function _getVersions(pluginName, frameworkName) {
  try {
    const path = require('path');

    const fs = require('fs');

    var v = {};
    var frameworkInfo = 'n/a';
    v.pluginVersion = 'n/a';
    v.extVersion = 'n/a';
    v.edition = 'n/a';
    v.cmdVersion = 'n/a';
    v.webpackVersion = 'n/a';
    var pluginPath = path.resolve(process.cwd(), 'node_modules/@sencha', pluginName);
    var pluginPkg = fs.existsSync(pluginPath + '/package.json') && JSON.parse(fs.readFileSync(pluginPath + '/package.json', 'utf-8')) || {};
    v.pluginVersion = pluginPkg.version;
    v._resolved = pluginPkg._resolved;

    if (v._resolved == undefined) {
      v.edition = `Commercial`;
    } else {
      if (-1 == v._resolved.indexOf('community')) {
        v.edition = `Commercial`;
      } else {
        v.edition = `Community`;
      }
    }

    var webpackPath = path.resolve(process.cwd(), 'node_modules/webpack');
    var webpackPkg = fs.existsSync(webpackPath + '/package.json') && JSON.parse(fs.readFileSync(webpackPath + '/package.json', 'utf-8')) || {};
    v.webpackVersion = webpackPkg.version;
    var extPath = path.resolve(process.cwd(), 'node_modules/@sencha/ext');
    var extPkg = fs.existsSync(extPath + '/package.json') && JSON.parse(fs.readFileSync(extPath + '/package.json', 'utf-8')) || {};
    v.extVersion = extPkg.sencha.version;
    var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/cmd`);
    var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
    v.cmdVersion = cmdPkg.version_full;

    if (v.cmdVersion == undefined) {
      var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/${pluginName}/node_modules/@sencha/cmd`);
      var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
      v.cmdVersion = cmdPkg.version_full;
    }

    if (frameworkName != undefined && frameworkName != 'extjs') {
      var frameworkPath = '';

      if (frameworkName == 'react') {
        frameworkPath = path.resolve(process.cwd(), 'node_modules/react');
      }

      if (frameworkName == 'angular') {
        frameworkPath = path.resolve(process.cwd(), 'node_modules/@angular/core');
      }

      var frameworkPkg = fs.existsSync(frameworkPath + '/package.json') && JSON.parse(fs.readFileSync(frameworkPath + '/package.json', 'utf-8')) || {};
      v.frameworkVersion = frameworkPkg.version;

      if (v.frameworkVersion == undefined) {
        frameworkInfo = ', ' + frameworkName;
      } else {
        frameworkInfo = ', ' + frameworkName + ' v' + v.frameworkVersion;
      }
    }

    return 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
  } catch (e) {
    return 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
  }
} //**********


function log(app, message) {
  var s = app + message;

  require('readline').cursorTo(process.stdout, 0);

  try {
    process.stdout.clearLine();
  } catch (e) {}

  process.stdout.write(s);
  process.stdout.write('\n');
} //**********


function logh(app, message) {
  var h = false;
  var s = app + message;

  if (h == true) {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(s);
    process.stdout.write('\n');
  }
} //**********


function logv(verbose, s) {
  if (verbose == 'yes') {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(`-verbose: ${s}`);
    process.stdout.write('\n');
  }
}
/**
 * FDB --uses 
 */


function _getValidateOptions() {
  return {
    "type": "object",
    "properties": {
      "framework": {
        "type": ["string"]
      },
      "toolkit": {
        "type": ["string"]
      },
      "theme": {
        "type": ["string"]
      },
      "emit": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "script": {
        "type": ["string"]
      },
      "port": {
        "type": ["integer"]
      },
      "packages": {
        "type": ["string", "array"]
      },
      "profile": {
        "type": ["string"]
      },
      "environment": {
        "errorMessage": "should be 'development' or 'production' string value",
        "type": ["string"]
      },
      "treeshake": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "browser": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "watch": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "verbose": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "inject": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "intellishake": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "uses": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "hotreload": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      }
    },
    "additionalProperties": false
  };
}

function _getDefaultOptions() {
  return {
    framework: 'extjs',
    toolkit: 'modern',
    theme: 'theme-material',
    emit: 'yes',
    script: null,
    port: 1962,
    packages: [],
    profile: '',
    environment: 'development',
    treeshake: 'no',
    browser: 'yes',
    watch: 'yes',
    verbose: 'no',
    inject: 'yes',
    intellishake: 'yes',

    /**
     * FDB --uses 
     */
    uses: 'yes',

    /**
     * FDB --hotreload 
     */
    hotreload: 'no'
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsImluaXRpYWxPcHRpb25zIiwiZnMiLCJyZXF1aXJlIiwidmFycyIsIm9wdGlvbnMiLCJmcmFtZXdvcmsiLCJ1bmRlZmluZWQiLCJwbHVnaW5FcnJvcnMiLCJwdXNoIiwicmVzdWx0IiwidHJlZXNoYWtlIiwidmVyYm9zZSIsInZhbGlkYXRlT3B0aW9ucyIsIl9nZXRWYWxpZGF0ZU9wdGlvbnMiLCJyYyIsImV4aXN0c1N5bmMiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJfZ2V0RGVmYXVsdE9wdGlvbnMiLCJfZ2V0RGVmYXVsdFZhcnMiLCJwbHVnaW5OYW1lIiwiYXBwIiwiX2dldEFwcCIsImxvZ3YiLCJlbnZpcm9ubWVudCIsInByb2R1Y3Rpb24iLCJicm93c2VyIiwid2F0Y2giLCJsb2ciLCJfZ2V0VmVyc2lvbnMiLCJpbnRlbGxpc2hha2UiLCJidWlsZHN0ZXAiLCJfdG9Qcm9kIiwic3RyaW5naWZ5IiwiY29uZmlnT2JqIiwiZSIsInRvU3RyaW5nIiwiX3RoaXNDb21waWxhdGlvbiIsImNvbXBpbGVyIiwiY29tcGlsYXRpb24iLCJzY3JpcHQiLCJydW5TY3JpcHQiLCJlcnIiLCJfY29tcGlsYXRpb24iLCJleHRDb21wb25lbnRzIiwiX2dldEFsbENvbXBvbmVudHMiLCJob29rcyIsInN1Y2NlZWRNb2R1bGUiLCJ0YXAiLCJtb2R1bGUiLCJyZXNvdXJjZSIsIm1hdGNoIiwiX3NvdXJjZSIsIl92YWx1ZSIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJkZXBzIiwiX2V4dHJhY3RGcm9tU291cmNlIiwiY29uc29sZSIsImZpbmlzaE1vZHVsZXMiLCJtb2R1bGVzIiwiX3dyaXRlRmlsZXNUb1Byb2RGb2xkZXIiLCJpbmplY3QiLCJodG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uIiwiZGF0YSIsInBhdGgiLCJqc1BhdGgiLCJleHRQYXRoIiwiY3NzUGF0aCIsImFzc2V0cyIsImpzIiwidW5zaGlmdCIsImNzcyIsIl9hZnRlckNvbXBpbGUiLCJfZW1pdCIsImNhbGxiYWNrIiwiZW1pdCIsIm91dHB1dFBhdGgiLCJqb2luIiwiZGV2U2VydmVyIiwiY29udGVudEJhc2UiLCJfcHJlcGFyZUZvckJ1aWxkIiwiY29tbWFuZCIsInJlYnVpbGQiLCJwYXJtcyIsInByb2ZpbGUiLCJ1c2VzIiwieCIsInNsaWNlIiwiY29uY2F0Iiwid2F0Y2hTdGFydGVkIiwiX2J1aWxkRXh0QnVuZGxlIiwiX2RvbmUiLCJzdGF0cyIsImVycm9ycyIsImxlbmd0aCIsImNoYWxrIiwicmVkIiwicHJvY2VzcyIsImV4aXQiLCJfdG9EZXYiLCJicm93c2VyQ291bnQiLCJ1cmwiLCJwb3J0IiwiaG90cmVsb2FkIiwib3BuIiwib3V0cHV0IiwicGFja2FnZXMiLCJ0b29sa2l0IiwidGhlbWUiLCJyaW1yYWYiLCJta2RpcnAiLCJmc3giLCJmaXJzdFRpbWUiLCJzeW5jIiwiYnVpbGRYTUwiLCJjcmVhdGVBcHBKc29uIiwiY3JlYXRlV29ya3NwYWNlSnNvbiIsImNyZWF0ZUpTRE9NRW52aXJvbm1lbnQiLCJ3cml0ZUZpbGVTeW5jIiwiY3dkIiwiZnJvbVBhdGgiLCJ0b1BhdGgiLCJjb3B5U3luYyIsInJlcGxhY2UiLCJmcm9tUmVzb3VyY2VzIiwidG9SZXNvdXJjZXMiLCJmaWx0ZXIiLCJ2YWx1ZSIsImluZGV4IiwiaW5kZXhPZiIsIm1hbmlmZXN0IiwiYnVuZGxlRGlyIiwidHJpbSIsInNlbmNoYSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwib25CdWlsZERvbmUiLCJvcHRzIiwic2lsZW50Iiwic3RkaW8iLCJlbmNvZGluZyIsIl9leGVjdXRlQXN5bmMiLCJ0aGVuIiwicmVhc29uIiwiREVGQVVMVF9TVUJTVFJTIiwic3Vic3RyaW5ncyIsInBja2ciLCJibHVlIiwiYnVpbGRpbmdQYWNrYWdlIiwiY3Jvc3NTcGF3biIsImNoaWxkIiwib24iLCJjb2RlIiwic2lnbmFsIiwiRXJyb3IiLCJlcnJvciIsInN0ZG91dCIsInN0ciIsInN1YnN0cmluZyIsInN0YXJ0c1dpdGgiLCJzb21lIiwidiIsInN0ZGVyciIsInN0ckphdmFPcHRzIiwieWVsbG93Iiwic2NyaXB0UGF0aCIsImNoaWxkUHJvY2VzcyIsImludm9rZWQiLCJmb3JrIiwiX3RvWHR5cGUiLCJwcmVmaXgiLCJwbGF0Zm9ybSIsImdyZWVuIiwiZnJhbWV3b3JrTmFtZSIsImZyYW1ld29ya0luZm8iLCJwbHVnaW5WZXJzaW9uIiwiZXh0VmVyc2lvbiIsImVkaXRpb24iLCJjbWRWZXJzaW9uIiwid2VicGFja1ZlcnNpb24iLCJwbHVnaW5QYXRoIiwicGx1Z2luUGtnIiwidmVyc2lvbiIsIl9yZXNvbHZlZCIsIndlYnBhY2tQYXRoIiwid2VicGFja1BrZyIsImV4dFBrZyIsImNtZFBhdGgiLCJjbWRQa2ciLCJ2ZXJzaW9uX2Z1bGwiLCJmcmFtZXdvcmtQYXRoIiwiZnJhbWV3b3JrUGtnIiwiZnJhbWV3b3JrVmVyc2lvbiIsIm1lc3NhZ2UiLCJzIiwiY3Vyc29yVG8iLCJjbGVhckxpbmUiLCJ3cml0ZSIsImxvZ2giLCJoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDTyxTQUFTQSxZQUFULENBQXNCQyxjQUF0QixFQUFzQztBQUN6QyxRQUFNQyxFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLE1BQUlDLElBQUksR0FBRyxFQUFYO0FBQ0EsTUFBSUMsT0FBTyxHQUFHLEVBQWQ7O0FBQ0EsTUFBSTtBQUNBLFFBQUlKLGNBQWMsQ0FBQ0ssU0FBZixJQUE0QkMsU0FBaEMsRUFBMkM7QUFDdkNILE1BQUFBLElBQUksQ0FBQ0ksWUFBTCxHQUFvQixFQUFwQjtBQUNBSixNQUFBQSxJQUFJLENBQUNJLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLDBIQUF2QjtBQUNBLFVBQUlDLE1BQU0sR0FBRztBQUNUTixRQUFBQSxJQUFJLEVBQUVBO0FBREcsT0FBYjtBQUdB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IjpbIi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9jb25zdHJ1Y3Rvcihpbml0aWFsT3B0aW9ucykge1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICAgIHZhciB2YXJzID0ge31cbiAgICB2YXIgb3B0aW9ucyA9IHt9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGluaXRpYWxPcHRpb25zLmZyYW1ld29yayA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhcnMucGx1Z2luRXJyb3JzID0gW11cbiAgICAgICAgICAgIHZhcnMucGx1Z2luRXJyb3JzLnB1c2goJ3dlYnBhY2sgY29uZmlnOiBmcmFtZXdvcmsgcGFyYW1ldGVyIG9uIGV4dC13ZWJwYWNrLXBsdWdpbiBpcyBub3QgZGVmaW5lZCAtIHZhbHVlczogcmVhY3QsIGFuZ3VsYXIsIGV4dGpzLCB3ZWItY29tcG9uZW50cycpXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHZhcnM6IHZhcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHZhciBmcmFtZXdvcmsgPSBpbml0aWFsT3B0aW9ucy5mcmFtZXdvcmtcbiAgICAgICAgdmFyIHRyZWVzaGFrZSA9IGluaXRpYWxPcHRpb25zLnRyZWVzaGFrZVxuICAgICAgICB2YXIgdmVyYm9zZSA9IGluaXRpYWxPcHRpb25zLnZlcmJvc2VcblxuICAgICAgICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICAgICAgICB2YWxpZGF0ZU9wdGlvbnMoX2dldFZhbGlkYXRlT3B0aW9ucygpLCBpbml0aWFsT3B0aW9ucywgJycpXG5cbiAgICAgICAgY29uc3QgcmMgPSAoZnMuZXhpc3RzU3luYyhgLmV4dC0ke2ZyYW1ld29ya31yY2ApICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGAuZXh0LSR7ZnJhbWV3b3JrfXJjYCwgJ3V0Zi04JykpIHx8IHt9KVxuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgLi4uX2dldERlZmF1bHRPcHRpb25zKCksXG4gICAgICAgICAgICAuLi5pbml0aWFsT3B0aW9ucyxcbiAgICAgICAgICAgIC4uLnJjXG4gICAgICAgIH1cblxuICAgICAgICB2YXJzID0gcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX2dldERlZmF1bHRWYXJzKClcbiAgICAgICAgdmFycy5wbHVnaW5OYW1lID0gJ2V4dC13ZWJwYWNrLXBsdWdpbidcbiAgICAgICAgdmFycy5hcHAgPSBfZ2V0QXBwKClcbiAgICAgICAgdmFyIHBsdWdpbk5hbWUgPSB2YXJzLnBsdWdpbk5hbWVcbiAgICAgICAgdmFyIGFwcCA9IHZhcnMuYXBwXG5cbiAgICAgICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2NvbnN0cnVjdG9yJylcbiAgICAgICAgbG9ndih2ZXJib3NlLCBgcGx1Z2luTmFtZSAtICR7cGx1Z2luTmFtZX1gKVxuICAgICAgICBsb2d2KHZlcmJvc2UsIGBhcHAgLSAke2FwcH1gKVxuXG4gICAgICAgIGlmIChvcHRpb25zLmVudmlyb25tZW50ID09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdmFycy5wcm9kdWN0aW9uID0gdHJ1ZVxuICAgICAgICAgICAgb3B0aW9ucy5icm93c2VyID0gJ25vJ1xuICAgICAgICAgICAgb3B0aW9ucy53YXRjaCA9ICdubydcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhcnMucHJvZHVjdGlvbiA9IGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICBsb2coYXBwLCBfZ2V0VmVyc2lvbnMocGx1Z2luTmFtZSwgZnJhbWV3b3JrKSlcblxuICAgICAgICAvL21qZyBhZGRlZCBmb3IgYW5ndWxhciBjbGkgYnVpbGRcbiAgICAgICAgaWYgKGZyYW1ld29yayA9PSAnYW5ndWxhcicgJiZcbiAgICAgICAgICAgIG9wdGlvbnMuaW50ZWxsaXNoYWtlID09ICdubycgJiZcbiAgICAgICAgICAgIHZhcnMucHJvZHVjdGlvbiA9PSB0cnVlICYmXG4gICAgICAgICAgICB0cmVlc2hha2UgPT0gJ3llcycpIHtcbiAgICAgICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMSc7XG4gICAgICAgICAgICBsb2coYXBwLCAnU3RhcnRpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJyArIGZyYW1ld29yayk7XG4gICAgICAgIH0gZWxzZSBpZiAoZnJhbWV3b3JrID09ICdyZWFjdCcgfHwgZnJhbWV3b3JrID09ICdleHRqcycgfHwgZnJhbWV3b3JrID09ICd3ZWItY29tcG9uZW50cycpIHtcbiAgICAgICAgICAgIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMSdcbiAgICAgICAgICAgICAgICBsb2coYXBwLCAnU3RhcnRpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJyArIGZyYW1ld29yaylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFycy5idWlsZHN0ZXAgPSAnMSBvZiAxJ1xuICAgICAgICAgICAgICAgIGxvZyhhcHAsICdTdGFydGluZyBkZXZlbG9wbWVudCBidWlsZCBmb3IgJyArIGZyYW1ld29yaylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKHRyZWVzaGFrZSA9PSAneWVzJykge1xuICAgICAgICAgICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMidcbiAgICAgICAgICAgICAgICBsb2coYXBwLCAnU3RhcnRpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJyArIGZyYW1ld29yayArICcgLSAnICsgdmFycy5idWlsZHN0ZXApXG4gICAgICAgICAgICAgICAgcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX3RvUHJvZCh2YXJzLCBvcHRpb25zKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXJzLmJ1aWxkc3RlcCA9ICcyIG9mIDInXG4gICAgICAgICAgICAgICAgbG9nKGFwcCwgJ0NvbnRpbnVpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJyArIGZyYW1ld29yayArICcgLSAnICsgdmFycy5idWlsZHN0ZXApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXJzLmJ1aWxkc3RlcCA9ICcxIG9mIDEnXG4gICAgICAgICAgICBsb2coYXBwLCAnU3RhcnRpbmcgZGV2ZWxvcG1lbnQgYnVpbGQgZm9yICcgKyBmcmFtZXdvcmspXG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZEQiAtIGxvZyBvcHRpb25zXG4gICAgICAgICAqL1xuICAgICAgICBsb2coYXBwLCAnT3B0aW9ucyBhcmUgJyArIEpTT04uc3RyaW5naWZ5KG9wdGlvbnMsIG51bGwsIDIpKTtcbiAgICAgICAgbG9ndih2ZXJib3NlLCAnQnVpbGRpbmcgZm9yICcgKyBvcHRpb25zLmVudmlyb25tZW50ICsgJywgJyArICd0cmVlc2hha2UgaXMgJyArIG9wdGlvbnMudHJlZXNoYWtlICsgJywgJyArICdpbnRlbGxpc2hha2UgaXMgJyArIG9wdGlvbnMuaW50ZWxsaXNoYWtlKVxuXG4gICAgICAgIHZhciBjb25maWdPYmogPSB7XG4gICAgICAgICAgICB2YXJzOiB2YXJzLFxuICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY29uZmlnT2JqO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgJ19jb25zdHJ1Y3RvcjogJyArIGUudG9TdHJpbmcoKVxuICAgIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX3RoaXNDb21waWxhdGlvbihjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgYXBwID0gdmFycy5hcHBcbiAgICAgICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICAgICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX3RoaXNDb21waWxhdGlvbicpXG4gICAgICAgIGxvZ3YodmVyYm9zZSwgYG9wdGlvbnMuc2NyaXB0OiAke29wdGlvbnMuc2NyaXB0IH1gKVxuICAgICAgICBsb2d2KHZlcmJvc2UsIGBidWlsZHN0ZXA6ICR7dmFycy5idWlsZHN0ZXB9YClcblxuICAgICAgICBpZiAodmFycy5idWlsZHN0ZXAgPT09ICcxIG9mIDEnIHx8IHZhcnMuYnVpbGRzdGVwID09PSAnMSBvZiAyJykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2NyaXB0ICE9IHVuZGVmaW5lZCAmJiBvcHRpb25zLnNjcmlwdCAhPSBudWxsICYmIG9wdGlvbnMuc2NyaXB0ICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgbG9nKGFwcCwgYFN0YXJ0ZWQgcnVubmluZyAke29wdGlvbnMuc2NyaXB0fWApXG4gICAgICAgICAgICAgICAgcnVuU2NyaXB0KG9wdGlvbnMuc2NyaXB0LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvZyhhcHAsIGBGaW5pc2hlZCBydW5uaW5nICR7b3B0aW9ucy5zY3JpcHR9YClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgJ190aGlzQ29tcGlsYXRpb246ICcgKyBlLnRvU3RyaW5nKClcbiAgICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9jb21waWxhdGlvbihjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgYXBwID0gdmFycy5hcHBcbiAgICAgICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICAgICAgdmFyIGZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gICAgICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9jb21waWxhdGlvbicpXG5cbiAgICAgICAgaWYgKGZyYW1ld29yayAhPSAnZXh0anMnKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmVlc2hha2UgPT09ICd5ZXMnICYmIG9wdGlvbnMuZW52aXJvbm1lbnQgPT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICAgIHZhciBleHRDb21wb25lbnRzID0gW107XG5cbiAgICAgICAgICAgICAgICAvL21qZyBmb3IgMSBzdGVwIGJ1aWxkXG4gICAgICAgICAgICAgICAgaWYgKHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDEnICYmIGZyYW1ld29yayA9PT0gJ2FuZ3VsYXInICYmIG9wdGlvbnMuaW50ZWxsaXNoYWtlID09ICdubycpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0Q29tcG9uZW50cyA9IHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9nZXRBbGxDb21wb25lbnRzKHZhcnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAyJyB8fCAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMScgJiYgZnJhbWV3b3JrID09PSAnd2ViLWNvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICAgICAgICBleHRDb21wb25lbnRzID0gcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX2dldEFsbENvbXBvbmVudHModmFycywgb3B0aW9ucylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tcGlsYXRpb24uaG9va3Muc3VjY2VlZE1vZHVsZS50YXAoYGV4dC1zdWNjZWVkLW1vZHVsZWAsIG1vZHVsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGUucmVzb3VyY2UgJiYgIW1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvbm9kZV9tb2R1bGVzLykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvXFwuaHRtbCQvKSAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZS5fc291cmNlLl92YWx1ZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdkb2N0eXBlIGh0bWwnKSA9PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJzLmRlcHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4odmFycy5kZXBzIHx8IFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9leHRyYWN0RnJvbVNvdXJjZShtb2R1bGUsIG9wdGlvbnMsIGNvbXBpbGF0aW9uLCBleHRDb21wb25lbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFycy5kZXBzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKHZhcnMuZGVwcyB8fCBbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fZXh0cmFjdEZyb21Tb3VyY2UobW9kdWxlLCBvcHRpb25zLCBjb21waWxhdGlvbiwgZXh0Q29tcG9uZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMicpIHtcbiAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5ob29rcy5maW5pc2hNb2R1bGVzLnRhcChgZXh0LWZpbmlzaC1tb2R1bGVzYCwgbW9kdWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl93cml0ZUZpbGVzVG9Qcm9kRm9sZGVyKHZhcnMsIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAxJyB8fCB2YXJzLmJ1aWxkc3RlcCA9PSAnMiBvZiAyJykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmluamVjdCA9PT0gJ3llcycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5CZWZvcmVIdG1sR2VuZXJhdGlvbi50YXAoYGV4dC1odG1sLWdlbmVyYXRpb25gLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLy92YXIganNQYXRoID0gcGF0aC5qb2luKHZhcnMuZXh0UGF0aCwgJ2V4dC5qcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3ZhciBjc3NQYXRoID0gcGF0aC5qb2luKHZhcnMuZXh0UGF0aCwgJ2V4dC5jc3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGpzUGF0aCA9IHZhcnMuZXh0UGF0aCArICcvJyArICdleHQuanMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNzc1BhdGggPSB2YXJzLmV4dFBhdGggKyAnLycgKyAnZXh0LmNzcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmFzc2V0cy5qcy51bnNoaWZ0KGpzUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuYXNzZXRzLmNzcy51bnNoaWZ0KGNzc1BhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2coYXBwLCBgQWRkaW5nICR7anNQYXRofSBhbmQgJHtjc3NQYXRofSB0byBpbmRleC5odG1sYClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93ICdfY29tcGlsYXRpb246ICcgKyBlLnRvU3RyaW5nKClcbiAgICAgICAgLy8gICAgbG9ndihvcHRpb25zLnZlcmJvc2UsZSlcbiAgICAgICAgLy8gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19jb21waWxhdGlvbjogJyArIGUpXG4gICAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfYWZ0ZXJDb21waWxlKGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucykge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciBhcHAgPSB2YXJzLmFwcFxuICAgICAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgICAgICB2YXIgZnJhbWV3b3JrID0gb3B0aW9ucy5mcmFtZXdvcmtcbiAgICAgICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2FmdGVyQ29tcGlsZScpXG4gICAgICAgIGlmIChmcmFtZXdvcmsgPT0gJ2V4dGpzJykge1xuICAgICAgICAgICAgcmVxdWlyZShgLi9leHRqc1V0aWxgKS5fYWZ0ZXJDb21waWxlKGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2FmdGVyQ29tcGlsZSBub3QgcnVuJylcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgJ19hZnRlckNvbXBpbGU6ICcgKyBlLnRvU3RyaW5nKClcbiAgICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9lbWl0KGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICAgIHZhciBhcHAgPSB2YXJzLmFwcFxuICAgICAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgICAgICB2YXIgZW1pdCA9IG9wdGlvbnMuZW1pdFxuICAgICAgICB2YXIgZnJhbWV3b3JrID0gb3B0aW9ucy5mcmFtZXdvcmtcbiAgICAgICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2VtaXQnKVxuICAgICAgICBpZiAoZW1pdCA9PSAneWVzJykge1xuICAgICAgICAgICAgaWYgKHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDEnIHx8IHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDInKSB7XG4gICAgICAgICAgICAgICAgbGV0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3V0cHV0UGF0aCwgdmFycy5leHRQYXRoKVxuICAgICAgICAgICAgICAgIGlmIChjb21waWxlci5vdXRwdXRQYXRoID09PSAnLycgJiYgY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vcHRpb25zLmRldlNlcnZlci5jb250ZW50QmFzZSwgb3V0cHV0UGF0aClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9ndih2ZXJib3NlLCAnb3V0cHV0UGF0aDogJyArIG91dHB1dFBhdGgpXG4gICAgICAgICAgICAgICAgbG9ndih2ZXJib3NlLCAnZnJhbWV3b3JrOiAnICsgZnJhbWV3b3JrKVxuICAgICAgICAgICAgICAgIGlmIChmcmFtZXdvcmsgIT0gJ2V4dGpzJykge1xuICAgICAgICAgICAgICAgICAgICBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aCwgY29tcGlsYXRpb24pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjb21tYW5kID0gJydcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy53YXRjaCA9PSAneWVzJyAmJiB2YXJzLnByb2R1Y3Rpb24gPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCA9ICd3YXRjaCdcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kID0gJ2J1aWxkJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodmFycy5yZWJ1aWxkID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcm1zID0gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJvZmlsZSA9PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5wcm9maWxlID09ICcnIHx8IG9wdGlvbnMucHJvZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWFuZCA9PSAnYnVpbGQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFybXMgPSBbJ2FwcCcsIGNvbW1hbmQsIG9wdGlvbnMuZW52aXJvbm1lbnRdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21tYW5kID09ICdidWlsZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgJy0td2ViLXNlcnZlcicsICdmYWxzZScsIG9wdGlvbnMucHJvZmlsZSwgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogRkRCIC0tdXNlc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudXNlcyA9PT0gJ3llcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHggPSBwYXJtcy5zbGljZSgwLCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgeC5wdXNoKCctLXVzZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFybXMgPSB4LmNvbmNhdChwYXJtcy5zbGljZSgyKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2d2KHZlcmJvc2UsICdCdWlsZENtZDogJyArIHBhcm1zLmpvaW4oJyAnKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhcnMud2F0Y2hTdGFydGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIHZhcnMsIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJzLndhdGNoU3RhcnRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9ndih2ZXJib3NlLCAnTk9UIHJ1bm5pbmcgZW1pdCcpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9ndih2ZXJib3NlLCAnZW1pdCBpcyBubycpXG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgdGhyb3cgJ19lbWl0OiAnICsgZS50b1N0cmluZygpXG4gICAgICAgIC8vIGxvZ3Yob3B0aW9ucy52ZXJib3NlLGUpXG4gICAgICAgIC8vIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfZW1pdDogJyArIGUpXG4gICAgICAgIC8vIGNhbGxiYWNrKClcbiAgICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9kb25lKHN0YXRzLCB2YXJzLCBvcHRpb25zKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICAgICAgdmFyIGZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gICAgICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9kb25lJylcbiAgICAgICAgaWYgKHN0YXRzLmNvbXBpbGF0aW9uLmVycm9ycyAmJiBzdGF0cy5jb21waWxhdGlvbi5lcnJvcnMubGVuZ3RoKSAvLyAmJiBwcm9jZXNzLmFyZ3YuaW5kZXhPZignLS13YXRjaCcpID09IC0xKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0cy5jb21waWxhdGlvbi5lcnJvcnNbMF0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL21qZyByZWZhY3RvclxuICAgICAgICBpZiAodmFycy5wcm9kdWN0aW9uID09IHRydWUgJiYgb3B0aW9ucy50cmVlc2hha2UgPT0gJ25vJyAmJiBmcmFtZXdvcmsgPT0gJ2FuZ3VsYXInKSB7XG4gICAgICAgICAgICByZXF1aXJlKGAuLyR7b3B0aW9ucy5mcmFtZXdvcmt9VXRpbGApLl90b0Rldih2YXJzLCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5icm93c2VyID09ICd5ZXMnICYmIG9wdGlvbnMud2F0Y2ggPT0gJ3llcycgJiYgdmFycy5wcm9kdWN0aW9uID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhcnMuYnJvd3NlckNvdW50ID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9ICdodHRwOi8vbG9jYWxob3N0OicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEZEQiAtIFByZXZlbnRzIGhvdCByZWxvYWRpbmcgKHNlZSB3ZWJwYWNrLWRldi1zZXJ2ZXIgY2xpZW50KVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaG90cmVsb2FkID09PSAnbm8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB1cmwgKyAnP2hvdHJlbG9hZD1mYWxzZSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBPcGVuaW5nIGJyb3dzZXIgYXQgJHt1cmx9YClcbiAgICAgICAgICAgICAgICAgICAgdmFycy5icm93c2VyQ291bnQrK1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcG4gPSByZXF1aXJlKCdvcG4nKVxuICAgICAgICAgICAgICAgICAgICBvcG4odXJsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMScpIHtcbiAgICAgICAgICAgIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZyh2YXJzLmFwcCwgYEVuZGluZyBwcm9kdWN0aW9uIGJ1aWxkIGZvciAke2ZyYW1ld29ya31gKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBFbmRpbmcgZGV2ZWxvcG1lbnQgYnVpbGQgZm9yICR7ZnJhbWV3b3JrfWApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhcnMuYnVpbGRzdGVwID09ICcyIG9mIDInKSB7XG4gICAgICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBFbmRpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJHtmcmFtZXdvcmt9YClcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLnZlcmJvc2UsZSlcbiAgICAgICAgdGhyb3cgJ19kb25lOiAnICsgZS50b1N0cmluZygpXG4gICAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0LCBjb21waWxhdGlvbikge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgICAgIHZhciBwYWNrYWdlcyA9IG9wdGlvbnMucGFja2FnZXNcbiAgICAgICAgdmFyIHRvb2xraXQgPSBvcHRpb25zLnRvb2xraXRcbiAgICAgICAgdmFyIHRoZW1lID0gb3B0aW9ucy50aGVtZVxuICAgICAgICBsb2d2KHZlcmJvc2UsICdGVU5DVElPTiBfcHJlcGFyZUZvckJ1aWxkJylcbiAgICAgICAgY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJylcbiAgICAgICAgY29uc3QgbWtkaXJwID0gcmVxdWlyZSgnbWtkaXJwJylcbiAgICAgICAgY29uc3QgZnN4ID0gcmVxdWlyZSgnZnMtZXh0cmEnKVxuICAgICAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgICB0aGVtZSA9IHRoZW1lIHx8ICh0b29sa2l0ID09PSAnY2xhc3NpYycgPyAndGhlbWUtdHJpdG9uJyA6ICd0aGVtZS1tYXRlcmlhbCcpXG4gICAgICAgIGxvZ3YodmVyYm9zZSwgJ2ZpcnN0VGltZTogJyArIHZhcnMuZmlyc3RUaW1lKVxuICAgICAgICBpZiAodmFycy5maXJzdFRpbWUpIHtcbiAgICAgICAgICAgIHJpbXJhZi5zeW5jKG91dHB1dClcbiAgICAgICAgICAgIG1rZGlycC5zeW5jKG91dHB1dClcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkWE1MID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5idWlsZFhNTFxuICAgICAgICAgICAgY29uc3QgY3JlYXRlQXBwSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlQXBwSnNvblxuICAgICAgICAgICAgY29uc3QgY3JlYXRlV29ya3NwYWNlSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlV29ya3NwYWNlSnNvblxuICAgICAgICAgICAgY29uc3QgY3JlYXRlSlNET01FbnZpcm9ubWVudCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlSlNET01FbnZpcm9ubWVudFxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnYnVpbGQueG1sJyksIGJ1aWxkWE1MKHZhcnMucHJvZHVjdGlvbiwgb3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnYXBwLmpzb24nKSwgY3JlYXRlQXBwSnNvbih0aGVtZSwgcGFja2FnZXMsIHRvb2xraXQsIG9wdGlvbnMsIG91dHB1dCksICd1dGY4JylcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2pzZG9tLWVudmlyb25tZW50LmpzJyksIGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQob3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnd29ya3NwYWNlLmpzb24nKSwgY3JlYXRlV29ya3NwYWNlSnNvbihvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG4gICAgICAgICAgICB2YXIgZnJhbWV3b3JrID0gdmFycy5mcmFtZXdvcms7XG4gICAgICAgICAgICAvL2JlY2F1c2Ugb2YgYSBwcm9ibGVtIHdpdGggY29sb3JwaWNrZXJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBgZXh0LSR7ZnJhbWV3b3JrfS91eC9gKSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJvbVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgYGV4dC0ke2ZyYW1ld29ya30vdXgvYClcbiAgICAgICAgICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgJ3V4JylcbiAgICAgICAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICAgICAgICBsb2coYXBwLCAnQ29weWluZyAodXgpICcgKyBmcm9tUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1BhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgYGV4dC0ke2ZyYW1ld29ya30vcGFja2FnZXMvYCkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGBleHQtJHtmcmFtZXdvcmt9L3BhY2thZ2VzL2ApXG4gICAgICAgICAgICAgICAgdmFyIHRvUGF0aCA9IHBhdGguam9pbihvdXRwdXQsICdwYWNrYWdlcycpXG4gICAgICAgICAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYXRoLCB0b1BhdGgpXG4gICAgICAgICAgICAgICAgbG9nKGFwcCwgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBgZXh0LSR7ZnJhbWV3b3JrfS9vdmVycmlkZXMvYCkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGBleHQtJHtmcmFtZXdvcmt9L292ZXJyaWRlcy9gKVxuICAgICAgICAgICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCAnb3ZlcnJpZGVzJylcbiAgICAgICAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICAgICAgICBsb2coYXBwLCAnQ29weWluZyAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNvdXJjZXMvJykpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZyb21SZXNvdXJjZXMgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc291cmNlcy8nKVxuICAgICAgICAgICAgICAgIHZhciB0b1Jlc291cmNlcyA9IHBhdGguam9pbihvdXRwdXQsICcuLi9yZXNvdXJjZXMnKVxuICAgICAgICAgICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUmVzb3VyY2VzLCB0b1Jlc291cmNlcylcbiAgICAgICAgICAgICAgICBsb2coYXBwLCAnQ29weWluZyAnICsgZnJvbVJlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1Jlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXJzLmZpcnN0VGltZSA9IGZhbHNlXG4gICAgICAgIHZhciBqcyA9ICcnXG4gICAgICAgIGlmICh2YXJzLnByb2R1Y3Rpb24pIHtcbiAgICAgICAgICAgIHZhcnMuZGVwcyA9IHZhcnMuZGVwcy5maWx0ZXIoZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhcnMuZGVwcy5pbmRleE9mKHZhbHVlKSA9PSBpbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBqcyA9IHZhcnMuZGVwcy5qb2luKCc7XFxuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcyA9IGBFeHQucmVxdWlyZShbXCJFeHQuKlwiLFwiRXh0LmRhdGEuVHJlZVN0b3JlXCJdKWBcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFycy5tYW5pZmVzdCA9PT0gbnVsbCB8fCBqcyAhPT0gdmFycy5tYW5pZmVzdCkge1xuICAgICAgICAgICAgdmFycy5tYW5pZmVzdCA9IGpzICsgJztcXG5FeHQucmVxdWlyZShbXCJFeHQubGF5b3V0LipcIl0pO1xcbic7XG4gICAgICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHBhdGguam9pbihvdXRwdXQsICdtYW5pZmVzdC5qcycpXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG1hbmlmZXN0LCB2YXJzLm1hbmlmZXN0LCAndXRmOCcpXG4gICAgICAgICAgICB2YXJzLnJlYnVpbGQgPSB0cnVlXG4gICAgICAgICAgICB2YXIgYnVuZGxlRGlyID0gb3V0cHV0LnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpXG4gICAgICAgICAgICBpZiAoYnVuZGxlRGlyLnRyaW0oKSA9PSAnJykge1xuICAgICAgICAgICAgICAgIGJ1bmRsZURpciA9ICcuLydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZyhhcHAsICdCdWlsZGluZyBFeHQgYnVuZGxlIGF0OiAnICsgYnVuZGxlRGlyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFycy5yZWJ1aWxkID0gZmFsc2VcbiAgICAgICAgICAgIGxvZyhhcHAsICdFeHQgcmVidWlsZCBOT1QgbmVlZGVkJylcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLnZlcmJvc2UsIGUpXG4gICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfcHJlcGFyZUZvckJ1aWxkOiAnICsgZSlcbiAgICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9idWlsZEV4dEJ1bmRsZShhcHAsIGNvbXBpbGF0aW9uLCBvdXRwdXRQYXRoLCBwYXJtcywgdmFycywgb3B0aW9ucykge1xuICAgIC8vICB0cnkge1xuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2J1aWxkRXh0QnVuZGxlJylcbiAgICBsZXQgc2VuY2hhO1xuICAgIHRyeSB7XG4gICAgICAgIHNlbmNoYSA9IHJlcXVpcmUoJ0BzZW5jaGEvY21kJylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNlbmNoYSA9ICdzZW5jaGEnXG4gICAgfVxuICAgIGlmIChmcy5leGlzdHNTeW5jKHNlbmNoYSkpIHtcbiAgICAgICAgbG9ndih2ZXJib3NlLCAnc2VuY2hhIGZvbGRlciBleGlzdHMnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ3YodmVyYm9zZSwgJ3NlbmNoYSBmb2xkZXIgRE9FUyBOT1QgZXhpc3QnKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBvbkJ1aWxkRG9uZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxvZ3YodmVyYm9zZSwgJ29uQnVpbGREb25lJylcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBvcHRzID0ge1xuICAgICAgICAgICAgY3dkOiBvdXRwdXRQYXRoLFxuICAgICAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICAgICAgc3RkaW86ICdwaXBlJyxcbiAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnXG4gICAgICAgIH1cbiAgICAgICAgX2V4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKS50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb25CdWlsZERvbmUoKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIHJlamVjdChyZWFzb24pXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9KVxuICAgIC8vIH1cbiAgICAvLyBjYXRjaChlKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZygnZScpXG4gICAgLy8gICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMudmVyYm9zZSxlKVxuICAgIC8vICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19idWlsZEV4dEJ1bmRsZTogJyArIGUpXG4gICAgLy8gICBjYWxsYmFjaygpXG4gICAgLy8gfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfZXhlY3V0ZUFzeW5jKGFwcCwgY29tbWFuZCwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4gICAgLy8gIHRyeSB7XG4gICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICB2YXIgZnJhbWV3b3JrID0gb3B0aW9ucy5mcmFtZXdvcmtcbiAgICAvL2NvbnN0IERFRkFVTFRfU1VCU1RSUyA9IFsnW0lORl0gTG9hZGluZycsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tMT0ddIEZhc2hpb24gYnVpbGQgY29tcGxldGUnLCAnW0VSUl0nLCAnW1dSTl0nLCBcIltJTkZdIFNlcnZlclwiLCBcIltJTkZdIFdyaXRpbmdcIiwgXCJbSU5GXSBMb2FkaW5nIEJ1aWxkXCIsIFwiW0lORl0gV2FpdGluZ1wiLCBcIltMT0ddIEZhc2hpb24gd2FpdGluZ1wiXTtcbiAgICBjb25zdCBERUZBVUxUX1NVQlNUUlMgPSBbXCJbSU5GXSB4U2VydmVyXCIsICdbSU5GXSBMb2FkaW5nJywgJ1tJTkZdIEFwcGVuZCcsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tJTkZdIFByb2Nlc3NpbmcgQnVpbGQnLCAnW0xPR10gRmFzaGlvbiBidWlsZCBjb21wbGV0ZScsICdbRVJSXScsICdbV1JOXScsIFwiW0lORl0gV3JpdGluZ1wiLCBcIltJTkZdIExvYWRpbmcgQnVpbGRcIiwgXCJbSU5GXSBXYWl0aW5nXCIsIFwiW0xPR10gRmFzaGlvbiB3YWl0aW5nXCJdO1xuICAgIHZhciBzdWJzdHJpbmdzID0gREVGQVVMVF9TVUJTVFJTXG4gICAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICAgIC8qKlxuICAgICAqIEZEQiAtIHVzZXNcbiAgICAgKi9cbiAgICB2YXIgcGNrZyA9IGAke2NoYWxrLmJsdWUoXCLihLkgW3Bja2ddOiBcIil9YDtcbiAgICB2YXIgYnVpbGRpbmdQYWNrYWdlID0gbnVsbDtcbiAgICBjb25zdCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24nKVxuICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9leGVjdXRlQXN5bmMnKVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgbG9ndih2ZXJib3NlLCBgY29tbWFuZCAtICR7Y29tbWFuZH1gKVxuICAgICAgICBsb2d2KHZlcmJvc2UsIGBwYXJtcyAtICR7cGFybXN9YClcbiAgICAgICAgbG9ndih2ZXJib3NlLCBgb3B0cyAtICR7SlNPTi5zdHJpbmdpZnkob3B0cyl9YClcbiAgICAgICAgbGV0IGNoaWxkID0gY3Jvc3NTcGF3bihjb21tYW5kLCBwYXJtcywgb3B0cylcbiAgICAgICAgY2hpbGQub24oJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgICAgbG9ndih2ZXJib3NlLCBgb24gY2xvc2U6IGAgKyBjb2RlKVxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKDApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKG5ldyBFcnJvcihjb2RlKSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGxvZ3YodmVyYm9zZSwgYG9uIGVycm9yYClcbiAgICAgICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGVycm9yKVxuICAgICAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgICB9KVxuICAgICAgICBjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRkRCIC0tdXNlcyAtIGFsd2F5cyBsb2cgYnVpbGRpbmcgcGFja2FnZSAgXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICghYnVpbGRpbmdQYWNrYWdlICYmIHN0ci5pbmRleE9mKCdbSU5GXSBCdWlsZGluZyBwYWNrYWdlOicpID49IDApIHtcbiAgICAgICAgICAgICAgICBidWlsZGluZ1BhY2thZ2UgPSBzdHIuc3Vic3RyaW5nKHN0ci5pbmRleE9mKCc6JykgKyAxKS50cmltKClcbiAgICAgICAgICAgICAgICBzdHIgPSBgPT09PT09PT09PT09PT0gQmVnaW4gQnVpbGRpbmcgcGFja2FnZSAke2J1aWxkaW5nUGFja2FnZX0gPT09PT09PT09PT09PT1gXG4gICAgICAgICAgICAgICAgbG9nKHBja2csIHN0cilcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChidWlsZGluZ1BhY2thZ2UgJiYgc3RyLnN0YXJ0c1dpdGgoJ1tJTkZdID09PT09PT09PT09PT09JykpIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBgPT09PT09PT09PT09PT0gRW5kIEJ1aWxkaW5nIHBhY2thZ2UgJHtidWlsZGluZ1BhY2thZ2V9ID09PT09PT09PT09PT09YFxuICAgICAgICAgICAgICAgIGJ1aWxkaW5nUGFja2FnZSA9IG51bGxcbiAgICAgICAgICAgICAgICBsb2cocGNrZywgc3RyKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2d2KHZlcmJvc2UsIGAke3N0cn1gKVxuICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS50b1N0cmluZygpLm1hdGNoKC9GYXNoaW9uIHdhaXRpbmcgZm9yIGNoYW5nZXNcXC5cXC5cXC4vKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgIC8vIHZhciBmaWxlbmFtZSA9IHByb2Nlc3MuY3dkKCkgKyB2YXJzLnRvdWNoRmlsZTtcbiAgICAgICAgICAgICAgICAvLyB0cnkge1xuICAgICAgICAgICAgICAgIC8vICAgdmFyIGQgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKClcbiAgICAgICAgICAgICAgICAvLyAgIHZhciBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZW5hbWUsICcvLycgKyBkLCAndXRmOCcpO1xuICAgICAgICAgICAgICAgIC8vICAgbG9ndihhcHAsIGB0b3VjaGluZyAke2ZpbGVuYW1lfWApO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAvLyBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgLy8gICBsb2d2KGFwcCwgYE5PVCB0b3VjaGluZyAke2ZpbGVuYW1lfWApO1xuICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgIHJlc29sdmUoMClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1YnN0cmluZ3Muc29tZShmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKHYpID49IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFwiW0lORl1cIiwgXCJcIilcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbTE9HXVwiLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykudHJpbSgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHIuaW5jbHVkZXMoXCJbRVJSXVwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goYXBwICsgc3RyLnJlcGxhY2UoL15cXFtFUlJcXF0gL2dpLCAnJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbRVJSXVwiLCBgJHtjaGFsay5yZWQoXCJbRVJSXVwiKX1gKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBGREJcbiAgICAgICAgICAgICAgICAgICAgICogbG9nKGFwcCwgc3RyKVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgbG9nKGJ1aWxkaW5nUGFja2FnZSA/IHBja2cgOiBhcHAsIHN0cik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgbG9ndihvcHRpb25zLCBgZXJyb3Igb24gY2xvc2U6IGAgKyBkYXRhKVxuICAgICAgICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG4gICAgICAgICAgICB2YXIgc3RySmF2YU9wdHMgPSBcIlBpY2tlZCB1cCBfSkFWQV9PUFRJT05TXCI7XG4gICAgICAgICAgICB2YXIgaW5jbHVkZXMgPSBzdHIuaW5jbHVkZXMoc3RySmF2YU9wdHMpXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZEQiBTb21ldGltZXMgc3RyIGlzIGVtcHR5ICBcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKHN0ciAmJiAhaW5jbHVkZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RyLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignd2FybmluZycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEZEQlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudmVyYm9zZSA9PSAneWVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7YXBwfSAke2NoYWxrLnllbGxvdyhcIltXQVJOXVwiKX0gJHtzdHJ9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHthcHB9ICR7Y2hhbGsucmVkKFwiW0VSUl1cIil9ICR7c3RyfWApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0pXG4gICAgLy8gfVxuICAgIC8vIGNhdGNoKGUpIHtcbiAgICAvLyAgIGxvZ3Yob3B0aW9ucyxlKVxuICAgIC8vICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19leGVjdXRlQXN5bmM6ICcgKyBlKVxuICAgIC8vICAgY2FsbGJhY2soKVxuICAgIC8vIH1cbn1cblxuLy8qKioqKioqKioqXG5mdW5jdGlvbiBydW5TY3JpcHQoc2NyaXB0UGF0aCwgY2FsbGJhY2spIHtcbiAgICB2YXIgY2hpbGRQcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hldGhlciBjYWxsYmFjayBoYXMgYmVlbiBpbnZva2VkIHRvIHByZXZlbnQgbXVsdGlwbGUgaW52b2NhdGlvbnNcbiAgICB2YXIgaW52b2tlZCA9IGZhbHNlO1xuICAgIHZhciBwcm9jZXNzID0gY2hpbGRQcm9jZXNzLmZvcmsoc2NyaXB0UGF0aCk7XG4gICAgLy8gbGlzdGVuIGZvciBlcnJvcnMgYXMgdGhleSBtYXkgcHJldmVudCB0aGUgZXhpdCBldmVudCBmcm9tIGZpcmluZ1xuICAgIHByb2Nlc3Mub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChpbnZva2VkKSByZXR1cm47XG4gICAgICAgIGludm9rZWQgPSB0cnVlO1xuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH0pO1xuICAgIC8vIGV4ZWN1dGUgdGhlIGNhbGxiYWNrIG9uY2UgdGhlIHByb2Nlc3MgaGFzIGZpbmlzaGVkIHJ1bm5pbmdcbiAgICBwcm9jZXNzLm9uKCdleGl0JywgZnVuY3Rpb24oY29kZSkge1xuICAgICAgICBpZiAoaW52b2tlZCkgcmV0dXJuO1xuICAgICAgICBpbnZva2VkID0gdHJ1ZTtcbiAgICAgICAgdmFyIGVyciA9IGNvZGUgPT09IDAgPyBudWxsIDogbmV3IEVycm9yKCdleGl0IGNvZGUgJyArIGNvZGUpO1xuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH0pO1xufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfdG9YdHlwZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXy9nLCAnLScpXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRBcHAoKSB7XG4gICAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICAgIHZhciBwcmVmaXggPSBgYFxuICAgIGNvbnN0IHBsYXRmb3JtID0gcmVxdWlyZSgnb3MnKS5wbGF0Zm9ybSgpXG4gICAgaWYgKHBsYXRmb3JtID09ICdkYXJ3aW4nKSB7XG4gICAgICAgIHByZWZpeCA9IGDihLkg772iZXh0772jOmBcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcmVmaXggPSBgaSBbZXh0XTpgXG4gICAgfVxuICAgIHJldHVybiBgJHtjaGFsay5ncmVlbihwcmVmaXgpfSBgXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRWZXJzaW9ucyhwbHVnaW5OYW1lLCBmcmFtZXdvcmtOYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICAgICAgdmFyIHYgPSB7fVxuICAgICAgICB2YXIgZnJhbWV3b3JrSW5mbyA9ICduL2EnXG5cbiAgICAgICAgdi5wbHVnaW5WZXJzaW9uID0gJ24vYSc7XG4gICAgICAgIHYuZXh0VmVyc2lvbiA9ICduL2EnO1xuICAgICAgICB2LmVkaXRpb24gPSAnbi9hJztcbiAgICAgICAgdi5jbWRWZXJzaW9uID0gJ24vYSc7XG4gICAgICAgIHYud2VicGFja1ZlcnNpb24gPSAnbi9hJztcblxuICAgICAgICB2YXIgcGx1Z2luUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzL0BzZW5jaGEnLCBwbHVnaW5OYW1lKVxuICAgICAgICB2YXIgcGx1Z2luUGtnID0gKGZzLmV4aXN0c1N5bmMocGx1Z2luUGF0aCArICcvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGx1Z2luUGF0aCArICcvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgICAgICAgdi5wbHVnaW5WZXJzaW9uID0gcGx1Z2luUGtnLnZlcnNpb25cbiAgICAgICAgdi5fcmVzb2x2ZWQgPSBwbHVnaW5Qa2cuX3Jlc29sdmVkXG4gICAgICAgIGlmICh2Ll9yZXNvbHZlZCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHYuZWRpdGlvbiA9IGBDb21tZXJjaWFsYFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKC0xID09IHYuX3Jlc29sdmVkLmluZGV4T2YoJ2NvbW11bml0eScpKSB7XG4gICAgICAgICAgICAgICAgdi5lZGl0aW9uID0gYENvbW1lcmNpYWxgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHYuZWRpdGlvbiA9IGBDb21tdW5pdHlgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHdlYnBhY2tQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMvd2VicGFjaycpXG4gICAgICAgIHZhciB3ZWJwYWNrUGtnID0gKGZzLmV4aXN0c1N5bmMod2VicGFja1BhdGggKyAnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHdlYnBhY2tQYXRoICsgJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICAgICAgICB2LndlYnBhY2tWZXJzaW9uID0gd2VicGFja1BrZy52ZXJzaW9uXG4gICAgICAgIHZhciBleHRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMvQHNlbmNoYS9leHQnKVxuICAgICAgICB2YXIgZXh0UGtnID0gKGZzLmV4aXN0c1N5bmMoZXh0UGF0aCArICcvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZXh0UGF0aCArICcvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgICAgICAgdi5leHRWZXJzaW9uID0gZXh0UGtnLnNlbmNoYS52ZXJzaW9uXG4gICAgICAgIHZhciBjbWRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGBub2RlX21vZHVsZXMvQHNlbmNoYS9jbWRgKVxuICAgICAgICB2YXIgY21kUGtnID0gKGZzLmV4aXN0c1N5bmMoY21kUGF0aCArICcvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY21kUGF0aCArICcvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgICAgICAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuICAgICAgICBpZiAodi5jbWRWZXJzaW9uID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgYG5vZGVfbW9kdWxlcy9Ac2VuY2hhLyR7cGx1Z2luTmFtZX0vbm9kZV9tb2R1bGVzL0BzZW5jaGEvY21kYClcbiAgICAgICAgICAgIHZhciBjbWRQa2cgPSAoZnMuZXhpc3RzU3luYyhjbWRQYXRoICsgJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjbWRQYXRoICsgJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICAgICAgICAgICAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZyYW1ld29ya05hbWUgIT0gdW5kZWZpbmVkICYmIGZyYW1ld29ya05hbWUgIT0gJ2V4dGpzJykge1xuICAgICAgICAgICAgdmFyIGZyYW1ld29ya1BhdGggPSAnJ1xuICAgICAgICAgICAgaWYgKGZyYW1ld29ya05hbWUgPT0gJ3JlYWN0Jykge1xuICAgICAgICAgICAgICAgIGZyYW1ld29ya1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcy9yZWFjdCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZnJhbWV3b3JrTmFtZSA9PSAnYW5ndWxhcicpIHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY29yZScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZnJhbWV3b3JrUGtnID0gKGZzLmV4aXN0c1N5bmMoZnJhbWV3b3JrUGF0aCArICcvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZnJhbWV3b3JrUGF0aCArICcvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgICAgICAgICAgIHYuZnJhbWV3b3JrVmVyc2lvbiA9IGZyYW1ld29ya1BrZy52ZXJzaW9uXG4gICAgICAgICAgICBpZiAodi5mcmFtZXdvcmtWZXJzaW9uID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGZyYW1ld29ya0luZm8gPSAnLCAnICsgZnJhbWV3b3JrTmFtZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtJbmZvID0gJywgJyArIGZyYW1ld29ya05hbWUgKyAnIHYnICsgdi5mcmFtZXdvcmtWZXJzaW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdleHQtd2VicGFjay1wbHVnaW4gdicgKyB2LnBsdWdpblZlcnNpb24gKyAnLCBFeHQgSlMgdicgKyB2LmV4dFZlcnNpb24gKyAnICcgKyB2LmVkaXRpb24gKyAnIEVkaXRpb24sIFNlbmNoYSBDbWQgdicgKyB2LmNtZFZlcnNpb24gKyAnLCB3ZWJwYWNrIHYnICsgdi53ZWJwYWNrVmVyc2lvbiArIGZyYW1ld29ya0luZm9cblxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuICdleHQtd2VicGFjay1wbHVnaW4gdicgKyB2LnBsdWdpblZlcnNpb24gKyAnLCBFeHQgSlMgdicgKyB2LmV4dFZlcnNpb24gKyAnICcgKyB2LmVkaXRpb24gKyAnIEVkaXRpb24sIFNlbmNoYSBDbWQgdicgKyB2LmNtZFZlcnNpb24gKyAnLCB3ZWJwYWNrIHYnICsgdi53ZWJwYWNrVmVyc2lvbiArIGZyYW1ld29ya0luZm9cbiAgICB9XG5cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gbG9nKGFwcCwgbWVzc2FnZSkge1xuICAgIHZhciBzID0gYXBwICsgbWVzc2FnZVxuICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgdHJ5IHtcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKHMpO1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBsb2doKGFwcCwgbWVzc2FnZSkge1xuICAgIHZhciBoID0gZmFsc2VcbiAgICB2YXIgcyA9IGFwcCArIG1lc3NhZ2VcbiAgICBpZiAoaCA9PSB0cnVlKSB7XG4gICAgICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKVxuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbiAgICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIGxvZ3YodmVyYm9zZSwgcykge1xuICAgIGlmICh2ZXJib3NlID09ICd5ZXMnKSB7XG4gICAgICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKVxuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgLXZlcmJvc2U6ICR7c31gKVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbiAgICB9XG59XG5cbi8qKlxuICogRkRCIC0tdXNlcyBcbiAqL1xuZnVuY3Rpb24gX2dldFZhbGlkYXRlT3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBcInR5cGVcIjogXCJvYmplY3RcIixcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgICAgIFwiZnJhbWV3b3JrXCI6IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0b29sa2l0XCI6IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0aGVtZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZW1pdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNjcmlwdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicG9ydFwiOiB7XG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcImludGVnZXJcIl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInBhY2thZ2VzXCI6IHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCIsIFwiYXJyYXlcIl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInByb2ZpbGVcIjoge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImVudmlyb25tZW50XCI6IHtcbiAgICAgICAgICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAnZGV2ZWxvcG1lbnQnIG9yICdwcm9kdWN0aW9uJyBzdHJpbmcgdmFsdWVcIixcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmVlc2hha2VcIjoge1xuICAgICAgICAgICAgICAgIFwiZXJyb3JNZXNzYWdlXCI6IFwic2hvdWxkIGJlICd5ZXMnIG9yICdubycgc3RyaW5nIHZhbHVlIChOT1QgdHJ1ZSBvciBmYWxzZSlcIixcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJicm93c2VyXCI6IHtcbiAgICAgICAgICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwid2F0Y2hcIjoge1xuICAgICAgICAgICAgICAgIFwiZXJyb3JNZXNzYWdlXCI6IFwic2hvdWxkIGJlICd5ZXMnIG9yICdubycgc3RyaW5nIHZhbHVlIChOT1QgdHJ1ZSBvciBmYWxzZSlcIixcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ2ZXJib3NlXCI6IHtcbiAgICAgICAgICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaW5qZWN0XCI6IHtcbiAgICAgICAgICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaW50ZWxsaXNoYWtlXCI6IHtcbiAgICAgICAgICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidXNlc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImhvdHJlbG9hZFwiOiB7XG4gICAgICAgICAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFwiYWRkaXRpb25hbFByb3BlcnRpZXNcIjogZmFsc2VcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIF9nZXREZWZhdWx0T3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBmcmFtZXdvcms6ICdleHRqcycsXG4gICAgICAgIHRvb2xraXQ6ICdtb2Rlcm4nLFxuICAgICAgICB0aGVtZTogJ3RoZW1lLW1hdGVyaWFsJyxcbiAgICAgICAgZW1pdDogJ3llcycsXG4gICAgICAgIHNjcmlwdDogbnVsbCxcbiAgICAgICAgcG9ydDogMTk2MixcbiAgICAgICAgcGFja2FnZXM6IFtdLFxuXG4gICAgICAgIHByb2ZpbGU6ICcnLFxuICAgICAgICBlbnZpcm9ubWVudDogJ2RldmVsb3BtZW50JyxcbiAgICAgICAgdHJlZXNoYWtlOiAnbm8nLFxuICAgICAgICBicm93c2VyOiAneWVzJyxcbiAgICAgICAgd2F0Y2g6ICd5ZXMnLFxuICAgICAgICB2ZXJib3NlOiAnbm8nLFxuICAgICAgICBpbmplY3Q6ICd5ZXMnLFxuICAgICAgICBpbnRlbGxpc2hha2U6ICd5ZXMnLFxuICAgICAgICAvKipcbiAgICAgICAgICogRkRCIC0tdXNlcyBcbiAgICAgICAgICovXG4gICAgICAgIHVzZXM6ICd5ZXMnLFxuICAgICAgICAvKipcbiAgICAgICAgICogRkRCIC0taG90cmVsb2FkIFxuICAgICAgICAgKi9cbiAgICAgICAgaG90cmVsb2FkOiAnbm8nXG5cbiAgICB9XG59Il19