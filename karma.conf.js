// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    plugins: ['karma-jasmine', 'karma-phantomjs-launcher'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/bootstrap/dist/js/bootstrap.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/leaflet/dist/leaflet-src.js',
      'app/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
      'app/bower_components/bootstrap-select/dist/js/bootstrap-select.js',
      'app/bower_components/nya-bootstrap-select/src/nya-bootstrap-select.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/angular-underscore/angular-underscore.js',
      'app/bower_components/ngDialog/js/ngDialog.js',
      'app/bower_components/zeroclipboard/dist/ZeroClipboard.js',
      'app/bower_components/ng-clip/src/ngClip.js',
      'app/bower_components/flow.js/dist/flow.js',
      'app/bower_components/ng-flow/dist/ng-flow.js',
      'app/bower_components/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js',
      'app/bower_components/angular-translate/angular-translate.js',
      'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'app/bower_components/highcharts-release/highcharts.js',
      'app/bower_components/highcharts-release/highcharts-more.js',
      'app/bower_components/highcharts-release/modules/exporting.js',
      'app/bower_components/highcharts-ng/dist/highcharts-ng.js',
      'node_modules/requirejs/require.js',
      'app/scripts/Control.Geocoder.js',
      //'node_modules/karma-requirejs/lib/adapter.js',
      'app/scripts/app.js',
      'app/scripts/directives/jquery.bootstrap.wizard.js',
      'app/scripts/directives/rcSubmit.js',
      'app/scripts/directives/rcForm.js',
      'app/scripts/directives/rcDisabled.js',
      'app/scripts/directives/rcWizard.js',
      'app/scripts/controllers/main.js',
      'app/scripts/controllers/register.js',
      'app/scripts/controllers/explore.js',
      'app/scripts/services/opensenseboxapi.js',
      'app/scripts/services/opensenseboxes.js',
      'app/scripts/services/opensenseboxessensors.js',
      'app/scripts/services/opensensemapdata.js',
      'app/scripts/services/filters.js',
      'app/scripts/services/validation.js',
      'app/scripts/services/opensensebox.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

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
    singleRun: false
  });
};
