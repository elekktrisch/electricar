require('expose?jQuery!jquery');
require('core-js');
require('angular');
require('angular-mocks');
require('./scripts/vendor/vendor');

var testsContext = require.context('.', true, /([a-zA-Z0-9_-]+)\/.+(\.spec\.js)+/);
testsContext.keys().forEach(testsContext);
