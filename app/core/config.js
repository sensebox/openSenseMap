(function() {
  'use strict';

  var core = angular.module('app.core');

  var config = {
    appVersion: '@@VERSION',
    appName: 'Zahngold Bernd',
    appTitle: 'openSenseMap',
    appApiUrl: 'https://api.osem.vo1d.space', //@@OPENSENSEMAP_API_URL
  };

  core.value('config', config);

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
