"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._getDefaultVars = _getDefaultVars;
exports._extractFromSource = _extractFromSource;
exports._toProd = _toProd;
exports._toDev = _toDev;
exports._getAllComponents = _getAllComponents;
exports._writeFilesToProdFolder = _writeFilesToProdFolder;

function _getDefaultVars() {
  return {
    touchFile: '/src/themer.js',
    watchStarted: false,
    buildstep: '1 of 1',
    firstTime: true,
    firstCompile: true,
    browserCount: 0,
    manifest: null,
    extPath: 'ext',
    pluginErrors: [],
    deps: [],
    usedExtWebComponents: [],
    rebuild: true
  };
}

function _extractFromSource(module, options, compilation, ExtWebComponents) {
  const logv = require('./pluginUtil').logv;

  const verbose = options.verbose;
  logv(verbose, 'FUNCTION _extractFromSource');
  var js = module._source._value;
  logv(verbose, module.resource);
  var statements = [];

  var generate = require("@babel/generator").default;

  var parse = require("babylon").parse;

  var traverse = require("ast-traverse");

  var ast = parse(js, {
    plugins: ['typescript', 'flow', 'doExpressions', 'objectRestSpread', 'classProperties', 'exportDefaultFrom', 'exportExtensions', 'asyncGenerators', 'functionBind', 'functionSent', 'dynamicImport'],
    sourceType: 'module'
  });
  traverse(ast, {
    pre: function (node) {
      if (node.type === 'CallExpression' && node.callee && node.callee.object && node.callee.object.name === 'Ext') {
        statements.push(generate(node).code);
      }

      if (node.type === 'CallExpression') {
        const code = generate(node).code;
        statements = statements.concat(getXtypeFromHTMLJS(code, statements, ExtWebComponents));
      }

      if (node.type === 'StringLiteral') {
        let code = node.value;

        for (var i = 0; i < code.length; ++i) {
          if (code.charAt(i) == '<') {
            if (code.substr(i, 4) == '<!--') {
              i += 4;
              i += code.substr(i).indexOf('-->') + 3;
            } else if (code.charAt(i + 1) !== '/') {
              var start = code.substring(i);
              var end = getEnd(start, [' ', '\n', '>']);
              var xtype = start.substring(1, end);

              if (ExtWebComponents.includes(xtype)) {
                xtype = xtype.substring(4, end);
                var theValue = node.value.toLowerCase();

                if (theValue.indexOf('doctype html') == -1) {
                  var config = `Ext.create(${JSON.stringify({
                    xtype: xtype
                  })})`;

                  if (statements.indexOf(config) < 0) {
                    statements.push(config);
                  }
                }
              }

              i += end;
            }
          }
        }

        statements = statements.concat(getXtypeFromHTMLJS(code, statements, ExtWebComponents));
      }
    }
  });
  return statements;
}

function getXtypeFromHTMLJS(code, statements, ExtWebComponents) {
  const logv = require('./pluginUtil').logv;

  const result = [];
  const xtypeRepetitons = (code.match(/xtype/g) || []).length;

  if (xtypeRepetitons > 0) {
    for (var j = 0; j < xtypeRepetitons; j++) {
      var start = code.substring(code.indexOf('xtype') + 5);
      var ifAsProps = start.indexOf(':');
      var ifAsAttribute = start.indexOf('=');
      start = start.substring(Math.min(ifAsProps, ifAsAttribute) + 1);
      start = start.trim();
      var end = getEnd(start, ['\n', '>', '}', '\r']);
      var xtype = start.substring(1, end).trim().replace(/['",]/g, '');
      var config = `Ext.create(${JSON.stringify({
        xtype: xtype
      })})`;

      if (ExtWebComponents.includes('ext-' + xtype) && statements.indexOf(config) === -1) {
        result.push(config);
      }

      code = start.substr(end).trim();
    }
  }

  return result;
}

function _toProd(vars, options) {
  const logv = require('./pluginUtil').logv;

  logv(options.verbose, 'FUNCTION _toProd (empty');

  try {} catch (e) {
    console.log(e);
    return [];
  }
}

function _toDev(vars, options) {
  try {} catch (e) {
    console.log(e);
    return [];
  }
}

function _getAllComponents(vars, options) {
  const log = require('./pluginUtil').log;

  const logv = require('./pluginUtil').logv;

  logv(options.verbose, 'FUNCTION _getAllComponents');

  const path = require('path');

  const fsx = require('fs-extra');

  var ExtWebComponents = [];
  const packageLibPath = path.resolve(process.cwd(), 'node_modules/@sencha/ext-web-components/lib');
  var files = fsx.readdirSync(packageLibPath);
  files.forEach(fileName => {
    if (fileName && fileName.substr(0, 4) == 'ext-') {
      var end = fileName.substr(4).indexOf('.component');

      if (end >= 0) {
        ExtWebComponents.push(fileName.substring(0, end + 4));
      }
    }
  });
  logv(options.verbose, `Identifying all ext-${options.framework} modules`); //log(vars.app, `Identifying all ext-${options.framework} modules`)

  return ExtWebComponents;
}

function _writeFilesToProdFolder(vars, options) {
  const logv = require('./pluginUtil').logv;

  logv(options.verbose, 'FUNCTION _writeFilesToProdFolder (empty)');

  try {} catch (e) {
    console.log(e);
  }
}

function getEnd(start, setOfSymbolsToCheck) {
  var endingsArr = [];

  for (var i = 0; i < setOfSymbolsToCheck.length; i++) {
    var symbolIndex = start.indexOf(setOfSymbolsToCheck[i]);

    if (symbolIndex !== -1) {
      endingsArr.push(symbolIndex);
    }
  }

  return Math.min(...endingsArr);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWItY29tcG9uZW50c1V0aWwuanMiXSwibmFtZXMiOlsiX2dldERlZmF1bHRWYXJzIiwidG91Y2hGaWxlIiwid2F0Y2hTdGFydGVkIiwiYnVpbGRzdGVwIiwiZmlyc3RUaW1lIiwiZmlyc3RDb21waWxlIiwiYnJvd3NlckNvdW50IiwibWFuaWZlc3QiLCJleHRQYXRoIiwicGx1Z2luRXJyb3JzIiwiZGVwcyIsInVzZWRFeHRXZWJDb21wb25lbnRzIiwicmVidWlsZCIsIl9leHRyYWN0RnJvbVNvdXJjZSIsIm1vZHVsZSIsIm9wdGlvbnMiLCJjb21waWxhdGlvbiIsIkV4dFdlYkNvbXBvbmVudHMiLCJsb2d2IiwicmVxdWlyZSIsInZlcmJvc2UiLCJqcyIsIl9zb3VyY2UiLCJfdmFsdWUiLCJyZXNvdXJjZSIsInN0YXRlbWVudHMiLCJnZW5lcmF0ZSIsImRlZmF1bHQiLCJwYXJzZSIsInRyYXZlcnNlIiwiYXN0IiwicGx1Z2lucyIsInNvdXJjZVR5cGUiLCJwcmUiLCJub2RlIiwidHlwZSIsImNhbGxlZSIsIm9iamVjdCIsIm5hbWUiLCJwdXNoIiwiY29kZSIsImNvbmNhdCIsImdldFh0eXBlRnJvbUhUTUxKUyIsInZhbHVlIiwiaSIsImxlbmd0aCIsImNoYXJBdCIsInN1YnN0ciIsImluZGV4T2YiLCJzdGFydCIsInN1YnN0cmluZyIsImVuZCIsImdldEVuZCIsInh0eXBlIiwiaW5jbHVkZXMiLCJ0aGVWYWx1ZSIsInRvTG93ZXJDYXNlIiwiY29uZmlnIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlc3VsdCIsInh0eXBlUmVwZXRpdG9ucyIsIm1hdGNoIiwiaiIsImlmQXNQcm9wcyIsImlmQXNBdHRyaWJ1dGUiLCJNYXRoIiwibWluIiwidHJpbSIsInJlcGxhY2UiLCJfdG9Qcm9kIiwidmFycyIsImUiLCJjb25zb2xlIiwibG9nIiwiX3RvRGV2IiwiX2dldEFsbENvbXBvbmVudHMiLCJwYXRoIiwiZnN4IiwicGFja2FnZUxpYlBhdGgiLCJyZXNvbHZlIiwicHJvY2VzcyIsImN3ZCIsImZpbGVzIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwiZmlsZU5hbWUiLCJmcmFtZXdvcmsiLCJfd3JpdGVGaWxlc1RvUHJvZEZvbGRlciIsInNldE9mU3ltYm9sc1RvQ2hlY2siLCJlbmRpbmdzQXJyIiwic3ltYm9sSW5kZXgiXSwibWFwcGluZ3MiOiJBQUNBOzs7Ozs7Ozs7Ozs7QUFFTyxTQUFTQSxlQUFULEdBQTJCO0FBQ2hDLFNBQU87QUFDTEMsSUFBQUEsU0FBUyxFQUFFLGdCQUROO0FBRUxDLElBQUFBLFlBQVksRUFBRyxLQUZWO0FBR0xDLElBQUFBLFNBQVMsRUFBRSxRQUhOO0FBSUxDLElBQUFBLFNBQVMsRUFBRyxJQUpQO0FBS0xDLElBQUFBLFlBQVksRUFBRSxJQUxUO0FBTUxDLElBQUFBLFlBQVksRUFBRyxDQU5WO0FBT0xDLElBQUFBLFFBQVEsRUFBRSxJQVBMO0FBUUxDLElBQUFBLE9BQU8sRUFBRSxLQVJKO0FBU0xDLElBQUFBLFlBQVksRUFBRSxFQVRUO0FBVUxDLElBQUFBLElBQUksRUFBRSxFQVZEO0FBV0xDLElBQUFBLG9CQUFvQixFQUFFLEVBWGpCO0FBWUxDLElBQUFBLE9BQU8sRUFBRTtBQVpKLEdBQVA7QUFjRDs7QUFFTSxTQUFTQyxrQkFBVCxDQUE0QkMsTUFBNUIsRUFBb0NDLE9BQXBDLEVBQTZDQyxXQUE3QyxFQUEwREMsZ0JBQTFELEVBQTRFO0FBQ2pGLFFBQU1DLElBQUksR0FBR0MsT0FBTyxDQUFDLGNBQUQsQ0FBUCxDQUF3QkQsSUFBckM7O0FBQ0EsUUFBTUUsT0FBTyxHQUFHTCxPQUFPLENBQUNLLE9BQXhCO0FBQ0FGLEVBQUFBLElBQUksQ0FBQ0UsT0FBRCxFQUFTLDZCQUFULENBQUo7QUFDQSxNQUFJQyxFQUFFLEdBQUdQLE1BQU0sQ0FBQ1EsT0FBUCxDQUFlQyxNQUF4QjtBQUNBTCxFQUFBQSxJQUFJLENBQUNFLE9BQUQsRUFBU04sTUFBTSxDQUFDVSxRQUFoQixDQUFKO0FBQ0EsTUFBSUMsVUFBVSxHQUFHLEVBQWpC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Q0FBY3lDLG1CQUFtQixDQUFDN0MsQ0FBRCxDQUFqQyxDQUFsQjs7QUFFQSxRQUFJK0MsV0FBVyxLQUFLLENBQUMsQ0FBckIsRUFBd0I7QUFDdEJELE1BQUFBLFVBQVUsQ0FBQ25ELElBQVgsQ0FBZ0JvRCxXQUFoQjtBQUNEO0FBQ0g7O0FBQ0QsU0FBT3pCLElBQUksQ0FBQ0MsR0FBTCxDQUFTLEdBQUd1QixVQUFaLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIlxuXCJ1c2Ugc3RyaWN0XCJcblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXREZWZhdWx0VmFycygpIHtcbiAgcmV0dXJuIHtcbiAgICB0b3VjaEZpbGU6ICcvc3JjL3RoZW1lci5qcycsXG4gICAgd2F0Y2hTdGFydGVkIDogZmFsc2UsXG4gICAgYnVpbGRzdGVwOiAnMSBvZiAxJyxcbiAgICBmaXJzdFRpbWUgOiB0cnVlLFxuICAgIGZpcnN0Q29tcGlsZTogdHJ1ZSxcbiAgICBicm93c2VyQ291bnQgOiAwLFxuICAgIG1hbmlmZXN0OiBudWxsLFxuICAgIGV4dFBhdGg6ICdleHQnLFxuICAgIHBsdWdpbkVycm9yczogW10sXG4gICAgZGVwczogW10sXG4gICAgdXNlZEV4dFdlYkNvbXBvbmVudHM6IFtdLFxuICAgIHJlYnVpbGQ6IHRydWVcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2V4dHJhY3RGcm9tU291cmNlKG1vZHVsZSwgb3B0aW9ucywgY29tcGlsYXRpb24sIEV4dFdlYkNvbXBvbmVudHMpIHtcbiAgY29uc3QgbG9ndiA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3ZcbiAgY29uc3QgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICBsb2d2KHZlcmJvc2UsJ0ZVTkNUSU9OIF9leHRyYWN0RnJvbVNvdXJjZScpXG4gIHZhciBqcyA9IG1vZHVsZS5fc291cmNlLl92YWx1ZVxuICBsb2d2KHZlcmJvc2UsbW9kdWxlLnJlc291cmNlKVxuICB2YXIgc3RhdGVtZW50cyA9IFtdXG5cbiAgdmFyIGdlbmVyYXRlID0gcmVxdWlyZShcIkBiYWJlbC9nZW5lcmF0b3JcIikuZGVmYXVsdFxuICB2YXIgcGFyc2UgPSByZXF1aXJlKFwiYmFieWxvblwiKS5wYXJzZVxuICB2YXIgdHJhdmVyc2UgPSByZXF1aXJlKFwiYXN0LXRyYXZlcnNlXCIpXG5cbiAgdmFyIGFzdCA9IHBhcnNlKGpzLCB7XG4gICAgcGx1Z2luczogW1xuICAgICAgJ3R5cGVzY3JpcHQnLFxuICAgICAgJ2Zsb3cnLFxuICAgICAgJ2RvRXhwcmVzc2lvbnMnLFxuICAgICAgJ29iamVjdFJlc3RTcHJlYWQnLFxuICAgICAgJ2NsYXNzUHJvcGVydGllcycsXG4gICAgICAnZXhwb3J0RGVmYXVsdEZyb20nLFxuICAgICAgJ2V4cG9ydEV4dGVuc2lvbnMnLFxuICAgICAgJ2FzeW5jR2VuZXJhdG9ycycsXG4gICAgICAnZnVuY3Rpb25CaW5kJyxcbiAgICAgICdmdW5jdGlvblNlbnQnLFxuICAgICAgJ2R5bmFtaWNJbXBvcnQnXG4gICAgXSxcbiAgICBzb3VyY2VUeXBlOiAnbW9kdWxlJ1xuICB9KVxuXG4gIHRyYXZlcnNlKGFzdCwge1xuICAgIHByZTogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLnR5cGUgPT09ICdDYWxsRXhwcmVzc2lvbicgJiYgbm9kZS5jYWxsZWUgJiYgbm9kZS5jYWxsZWUub2JqZWN0ICYmIG5vZGUuY2FsbGVlLm9iamVjdC5uYW1lID09PSAnRXh0Jykge1xuICAgICAgICBzdGF0ZW1lbnRzLnB1c2goZ2VuZXJhdGUobm9kZSkuY29kZSlcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnR5cGUgPT09ICdDYWxsRXhwcmVzc2lvbicpIHtcbiAgICAgICAgY29uc3QgY29kZSA9IGdlbmVyYXRlKG5vZGUpLmNvZGU7XG4gICAgICAgIHN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLmNvbmNhdChnZXRYdHlwZUZyb21IVE1MSlMoY29kZSwgc3RhdGVtZW50cywgRXh0V2ViQ29tcG9uZW50cykpO1xuICAgICAgfVxuICAgICAgaWYobm9kZS50eXBlID09PSAnU3RyaW5nTGl0ZXJhbCcpIHtcbiAgICAgICAgbGV0IGNvZGUgPSBub2RlLnZhbHVlXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29kZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGlmIChjb2RlLmNoYXJBdChpKSA9PSAnPCcpIHtcbiAgICAgICAgICAgIGlmIChjb2RlLnN1YnN0cihpLCA0KSA9PSAnPCEtLScpIHtcbiAgICAgICAgICAgICAgaSArPSA0XG4gICAgICAgICAgICAgIGkgKz0gY29kZS5zdWJzdHIoaSkuaW5kZXhPZignLS0+JykgKyAzXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvZGUuY2hhckF0KGkrMSkgIT09ICcvJykge1xuICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBjb2RlLnN1YnN0cmluZyhpKVxuICAgICAgICAgICAgICB2YXIgZW5kID0gZ2V0RW5kKHN0YXJ0LCBbJyAnLCAnXFxuJywgJz4nXSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgeHR5cGUgPSBzdGFydC5zdWJzdHJpbmcoMSwgZW5kKVxuICAgICAgICAgICAgICAgIGlmKEV4dFdlYkNvbXBvbmVudHMuaW5jbHVkZXMoeHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICB4dHlwZSA9IHh0eXBlLnN1YnN0cmluZyg0LCBlbmQpO1xuICAgICAgICAgICAgICAgICAgdmFyIHRoZVZhbHVlID0gbm9kZS52YWx1ZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICBpZiAodGhlVmFsdWUuaW5kZXhPZignZG9jdHlwZSBodG1sJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbmZpZyA9IGBFeHQuY3JlYXRlKCR7SlNPTi5zdHJpbmdpZnkoe3h0eXBlOiB4dHlwZX0pfSlgO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnRzLmluZGV4T2YoY29uZmlnKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzLnB1c2goY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpICs9IGVuZFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3RhdGVtZW50cyA9IHN0YXRlbWVudHMuY29uY2F0KGdldFh0eXBlRnJvbUhUTUxKUyhjb2RlLCBzdGF0ZW1lbnRzLCBFeHRXZWJDb21wb25lbnRzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHN0YXRlbWVudHNcbn1cblxuZnVuY3Rpb24gZ2V0WHR5cGVGcm9tSFRNTEpTKGNvZGUsIHN0YXRlbWVudHMsIEV4dFdlYkNvbXBvbmVudHMpIHtcbiAgY29uc3QgbG9ndiA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3ZcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGNvbnN0IHh0eXBlUmVwZXRpdG9ucyA9IChjb2RlLm1hdGNoKC94dHlwZS9nKSB8fCBbXSkubGVuZ3RoO1xuXG4gIGlmICh4dHlwZVJlcGV0aXRvbnMgPiAwKSB7XG4gICAgZm9yICh2YXIgaj0wOyBqPHh0eXBlUmVwZXRpdG9uczsgaisrKSB7XG4gICAgICB2YXIgc3RhcnQgPSBjb2RlLnN1YnN0cmluZyhjb2RlLmluZGV4T2YoJ3h0eXBlJykgKyA1KTtcbiAgICAgIHZhciBpZkFzUHJvcHMgPSBzdGFydC5pbmRleE9mKCc6Jyk7XG4gICAgICB2YXIgaWZBc0F0dHJpYnV0ZSA9IHN0YXJ0LmluZGV4T2YoJz0nKTtcbiAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKE1hdGgubWluKGlmQXNQcm9wcywgaWZBc0F0dHJpYnV0ZSkgKyAxKTtcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJpbSgpO1xuICAgICAgdmFyIGVuZCA9IGdldEVuZChzdGFydCwgWydcXG4nLCAnPicsJ30nLCAnXFxyJ10pXG4gICAgICB2YXIgeHR5cGUgPSBzdGFydC5zdWJzdHJpbmcoMSwgZW5kKS50cmltKCkucmVwbGFjZSgvWydcIixdL2csICcnKTtcblxuICAgICAgdmFyIGNvbmZpZyA9IGBFeHQuY3JlYXRlKCR7SlNPTi5zdHJpbmdpZnkoe3h0eXBlOiB4dHlwZX0pfSlgO1xuICAgICAgaWYoRXh0V2ViQ29tcG9uZW50cy5pbmNsdWRlcygnZXh0LScgKyB4dHlwZSkgJiYgc3RhdGVtZW50cy5pbmRleE9mKGNvbmZpZykgPT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvbmZpZyk7XG4gICAgICB9XG4gICAgICBjb2RlID0gc3RhcnQuc3Vic3RyKGVuZCkudHJpbSgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfdG9Qcm9kKHZhcnMsIG9wdGlvbnMpIHtcbiAgY29uc3QgbG9ndiA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3ZcbiAgbG9ndihvcHRpb25zLnZlcmJvc2UsJ0ZVTkNUSU9OIF90b1Byb2QgKGVtcHR5JylcbiAgdHJ5IHtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKGUpXG4gICAgcmV0dXJuIFtdXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF90b0Rldih2YXJzLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZyhlKVxuICAgIHJldHVybiBbXVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0QWxsQ29tcG9uZW50cyh2YXJzLCBvcHRpb25zKSB7XG4gIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMudmVyYm9zZSwnRlVOQ1RJT04gX2dldEFsbENvbXBvbmVudHMnKVxuXG4gIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgY29uc3QgZnN4ID0gcmVxdWlyZSgnZnMtZXh0cmEnKVxuXG4gIHZhciBFeHRXZWJDb21wb25lbnRzID0gW11cbiAgY29uc3QgcGFja2FnZUxpYlBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC13ZWItY29tcG9uZW50cy9saWInKVxuICB2YXIgZmlsZXMgPSBmc3gucmVhZGRpclN5bmMocGFja2FnZUxpYlBhdGgpXG4gIGZpbGVzLmZvckVhY2goKGZpbGVOYW1lKSA9PiB7XG4gICAgaWYgKGZpbGVOYW1lICYmIGZpbGVOYW1lLnN1YnN0cigwLCA0KSA9PSAnZXh0LScpIHtcbiAgICAgIHZhciBlbmQgPSBmaWxlTmFtZS5zdWJzdHIoNCkuaW5kZXhPZignLmNvbXBvbmVudCcpXG4gICAgICBpZiAoZW5kID49IDApIHtcbiAgICAgICAgRXh0V2ViQ29tcG9uZW50cy5wdXNoKGZpbGVOYW1lLnN1YnN0cmluZygwLCBlbmQgKyA0KSlcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIGxvZ3Yob3B0aW9ucy52ZXJib3NlLCBgSWRlbnRpZnlpbmcgYWxsIGV4dC0ke29wdGlvbnMuZnJhbWV3b3JrfSBtb2R1bGVzYClcbiAgLy9sb2codmFycy5hcHAsIGBJZGVudGlmeWluZyBhbGwgZXh0LSR7b3B0aW9ucy5mcmFtZXdvcmt9IG1vZHVsZXNgKVxuICByZXR1cm4gRXh0V2ViQ29tcG9uZW50c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX3dyaXRlRmlsZXNUb1Byb2RGb2xkZXIodmFycywgb3B0aW9ucykge1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMudmVyYm9zZSwnRlVOQ1RJT04gX3dyaXRlRmlsZXNUb1Byb2RGb2xkZXIgKGVtcHR5KScpXG4gIHRyeSB7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZyhlKVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEVuZChzdGFydCwgc2V0T2ZTeW1ib2xzVG9DaGVjaykge1xuICB2YXIgZW5kaW5nc0FyciA9IFtdO1xuXG4gIGZvciAodmFyIGk9MDtpPHNldE9mU3ltYm9sc1RvQ2hlY2subGVuZ3RoO2krKykge1xuICAgICB2YXIgc3ltYm9sSW5kZXggPSBzdGFydC5pbmRleE9mKHNldE9mU3ltYm9sc1RvQ2hlY2tbaV0pO1xuXG4gICAgIGlmIChzeW1ib2xJbmRleCAhPT0gLTEpIHtcbiAgICAgICBlbmRpbmdzQXJyLnB1c2goc3ltYm9sSW5kZXgpO1xuICAgICB9XG4gIH1cbiAgcmV0dXJuIE1hdGgubWluKC4uLmVuZGluZ3NBcnIpXG59XG4iXX0=