module.exports = function() {
  return {
    basePath: '../',
    frameworks: ['mocha', 'chai', 'sinon', 'chai-sinon'],
    reporters: ['progress', 'html'],
    browsers: ['PhantomJS'],
    autoWatch: true,
    port: 8080,

    // these are default values anyway
    singleRun: false,
    colors: true,

    files : [
      //3rd Party Code
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',

      //App-specific Code
      'app/scripts/app.js',
      'app/scripts/services/**/*.js',


      //Test-Specific Code
      'node_modules/bardjs/dist/bard.js',
      'node_modules/chai/chai.js',
      'test/lib/chai-should.js',
      'test/lib/chai-expect.js',
      'test/lib/chai-assert.js'
    ]
  }
};
