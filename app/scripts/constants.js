(function () {
  'use strict';

  angular.module('app.core', [

  ])
    .constant('app', {
      VERSION: '@@VERSION',
      REVISION: '@@REVISION',
      NAME: '',
      API_URL: '@@OPENSENSEMAP_API_URL',
      MICROADAPTER_TINGG_URL: '@@TINGG_MICRO_URL'
    });
})();
