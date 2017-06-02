// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  var conf = sharedConfig();

  conf.files = conf.files.concat([
    //extra testing code
    // 'bower_components/angular-mocks/angular-mocks.js',

    //mocha stuff
    // 'test/mocha.conf.js',

    //test files
    'test/spec/services/authentication.js'
  ]);

  config.set(conf);
};
