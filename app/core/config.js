(function() {
  'use strict';

  var core = angular.module('app.core');

  core.config(configure);

  configure.$inject = ['$translateProvider']

  /* @ngInject */
  function configure ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: '../../translations/',
      suffix: '.json'
    });
    $translateProvider.use('de_DE');
    $translateProvider.fallbackLanguage('en_US');
    $translateProvider.preferredLanguage('de_DE');
    $translateProvider.determinePreferredLanguage();
    $translateProvider.useSanitizeValueStrategy('escaped');
  }
})();
