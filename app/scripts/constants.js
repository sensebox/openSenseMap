(function() {
  'use strict';

  angular.module('app.core', [

  ])
  .constant('app', {
    VERSION: '@@VERSION',
    REVISION: '@@REVISION',
    NAME: 'Zahngold Bernd',
    API_URL: '@@OPENSENSEMAP_API_URL'
  });
})();
