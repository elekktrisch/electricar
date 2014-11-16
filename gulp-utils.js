'use strict';
var config = require('./gulp-config.js');

var gulp = require('gulp');
var clean = require('gulp-clean');
var order = require("gulp-order");
var inject = require('gulp-inject');
var angularTemplatecache = require('gulp-angular-templatecache');
var es = require('event-stream');
var minifyHtml = require('gulp-minify-html');
var replace = require('gulp-token-replace');
var filter = require('gulp-filter');

function Utils() {
  this._minify = false;
  this._buildDist = false;
}

Utils.prototype = {
  minify: function () {
    return this._minify;
  },
  setMinify: function (doMinify) {
    this._minify = doMinify;
  },
  buildDist: function () {
    return this._buildDist;
  },
  setBuildDist: function (doBuildDist) {
    this._buildDist = doBuildDist;
  }
};

Utils.prototype.clean = function (directories) {
  return es.merge(gulp.src(directories, {read: false}))
    .pipe(clean());
};

function replaceEnvVars(e) {
  return replace({
    global: {
      tokens: {
        SERVER_PROTOCOL: e.serverProtocol,
        SERVER_WS_PORT: e.serverPort,
        SERVER_APPLICATION_ROOT: e.serverBasePath,
        LOGOUT_URL: e.logoutUrl
      }
    },
    prefix: '[[[',
    suffix: ']]]',
    preserveUnknownTokens: true
  });
}

Utils.prototype.prepareScripts = function (srcDir, htmlTemplatesPattern, jsFilesPattern, configFilesPattern, e) {
  console.info('preparing files from ' + srcDir + htmlTemplatesPattern + ', ' + srcDir + jsFilesPattern + ', ' + srcDir + configFilesPattern);
  var angularTemplateCacheOptions = {
    module: 'app'
  };
  var minifyHtmlOtions = {
    quotes: true,
    empty: true
  };

  var allHtml = gulp.src(srcDir + htmlTemplatesPattern)
    .pipe(minifyHtml(minifyHtmlOtions));

  if (!e.includeDevtools) {
    allHtml = allHtml
      .pipe(filter('**/!(devtools)*'))
  }

  var allScripts = es.merge(
    allHtml
      .pipe(angularTemplatecache(angularTemplateCacheOptions)),
    gulp.src(srcDir + jsFilesPattern),
    gulp.src(srcDir + configFilesPattern)
      .pipe(replaceEnvVars(e)));

  if (!e.includeDevtools) {
    allScripts = allScripts
      .pipe(filter('**/!(devtools)*'))
  }
  return  allScripts;
};

Utils.prototype.injectScriptNames = function (destinationDir, e) {
  var cssLibFiles = es.merge(
    gulp.src(destinationDir + config.paths.lib + config.patterns.cssFiles, {read: false}),
    gulp.src(destinationDir + config.paths.styles + '*.css', {read: false})
  )
    .pipe(order(config.cssOrder));

  var jsAppFiles = gulp.src(destinationDir + config.patterns.jsFiles, {read: false})
    .pipe(order(config.jsOrder));

  var injectOptions = {ignorePath: destinationDir, addRootSlash: false};

  return gulp.src(config.paths.src + config.paths.indexHtml)
    .pipe(replaceEnvVars(e))
    .pipe(inject(cssLibFiles, injectOptions))
    .pipe(inject(jsAppFiles, injectOptions))
    .pipe(gulp.dest(destinationDir));
};


Utils.prototype.execForDist = function (previousStep, executeConditional) {
  var nextStep = previousStep;
  if (this.buildDist()) {
    nextStep = executeConditional();
  }
  return nextStep;
};

var inst = new Utils();
module.exports = inst;