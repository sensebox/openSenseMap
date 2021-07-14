(function () {
  'use strict';

  angular.module('app.core', [

  ])
    .constant('app', {
      VERSION: '@@VERSION',
      REVISION: '@@REVISION',
      NAME: '@@NAME',
      API_URL: '@@OPENSENSEMAP_API_URL'
    });
})();
