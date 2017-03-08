(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .factory('AuthenticationInterceptor', AuthenticationInterceptor);

  AuthenticationInterceptor.$inject = ['$q', 'AuthenticationService'];

  function AuthenticationInterceptor ($q, AuthenticationService) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if (AuthenticationService.getToken()) {
          config.headers.Authorization = 'Bearer ' + AuthenticationService.getToken();
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
          // handle the case where the user is not authenticated
        }
        return response || $q.when(response);
      }
    };
  }
})();
