(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('AuthenticationInterceptor', AuthenticationInterceptor);

  AuthenticationInterceptor.$inject = ['$q', '$injector', 'AuthenticationService', 'OpenSenseBoxAPI'];

  function AuthenticationInterceptor ($q, $injector, AuthenticationService, OpenSenseBoxAPI) {
    var inFlightAuthRequest = null;

    return {
      request: function (config) {
        config.headers = config.headers || {};
        if (angular.isDefined(config.auth) && config.auth === true && AuthenticationService.getToken()) {
          config.headers.Authorization = 'Bearer ' + AuthenticationService.getToken();
        }
        return config;
      },
      responseError: function (response) {
        if (response.config.url.match('/users/me/')) {
          switch (response.status) {
            case 401:
              var deferred = $q.defer();
              if(!inFlightAuthRequest) {
                  inFlightAuthRequest = $injector.get('$http').post(OpenSenseBoxAPI.url + '/users/refresh-auth', {token: AuthenticationService.getRefreshToken()});
              }
              inFlightAuthRequest.then(function(r) {
                  inFlightAuthRequest = null;
                  if (r.data.token && r.data.refreshToken) {
                      AuthenticationService.saveToken(r.data.data.token);
                      AuthenticationService.saveRefreshToken(r.data.data.refreshToken);
                      $injector.get('$http')(response.config).then(function(resp) {
                          deferred.resolve(resp);
                      },function(resp) {
                          deferred.reject();
                      });
                  } else {
                      deferred.reject();
                  }
              }, function(response) {
                  inFlightAuthRequest = null;
                  deferred.reject();
                  AuthenticationService.logout();
                  $injector.get('$state').go('explore.map');
                  return;
              });
              return deferred.promise;
              break;
            default:
              AuthenticationService.logout();
              $injector.get('$state').go('explore.map');
              break;
          }
        }
        return $q.reject(response);
      }
    };
  }
})();
