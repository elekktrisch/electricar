// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/lodash/dist/lodash.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-bootstrap/ui-bootstrap.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-ui-slider/src/slider.js',
      'app/scripts/**/*-module.js',
      'app/scripts/**/*.js',
      'dev/templates.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 9876,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    reporters: ['progress', 'dots', 'coverage', 'junit'],
    
    // http://karma-runner.github.io/0.8/plus/Jenkins-CI.html
    junitReporter : {
        outputFile: 'karma_unit/test-results.xml'
    },

    // the default configuration
    htmlReporter: {
      outputDir: 'karma_html',
      templatePath: 'node_modules/karma-html-reporter/jasmine_template.html'
    },
    preprocessors: {
      'app/scripts/**/*.js': ['coverage']
    },
    coverageReporter: {
      dir: "coverage/"
    }
  });
};
