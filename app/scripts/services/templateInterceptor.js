(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('TemplateCacheInterceptor', TemplateCacheInterceptor);

  TemplateCacheInterceptor.$inject = ['$injector'];
  function TemplateCacheInterceptor($injector) {
    return {
      'request': function (config) {

        if (config.url.indexOf('views') !== -1 || config.url.indexOf('components') !== -1 || config.url.indexOf('translations') !== -1) {
          var d = new Date();
          var ms = d.getTime();
          config.url = config.url + '?t=' + ms;
        }

        return config;
      }
    }
  }
})();
