(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('AuthenticationInterceptor', AuthenticationInterceptor);

  AuthenticationInterceptor.$inject = ['$q', '$injector', 'AuthenticationService', 'app'];

  function AuthenticationInterceptor ($q, $injector, AuthenticationService, app) {
    var inFlightAuthRequest = null;

    return {
      request: function (config) {
        config.headers = config.headers || {};
        if (angular.isDefined(config.auth) && config.auth && AuthenticationService.getToken()) {
          config.headers.Authorization = 'Bearer ' + AuthenticationService.getToken();
        }

        return config;
      },
      responseError: function (response) {
        if (response.config.auth) {
          switch (response.status) {
          case 401:
          case 403:
            var deferred = $q.defer();
            if (!inFlightAuthRequest) {
              inFlightAuthRequest = $injector.get('$http').post(app.API_URL + '/users/refresh-auth', { token: AuthenticationService.getRefreshToken() });
            }
            inFlightAuthRequest.then(function (r) {
              inFlightAuthRequest = null;
              if (r.data.token && r.data.refreshToken) {
                AuthenticationService.saveToken(r.data.token);
                AuthenticationService.saveRefreshToken(r.data.refreshToken);
                AuthenticationService.saveUser(JSON.stringify(r.data.data.user));

                $injector.get('$rootScope').$emit('loggedIn', r.data);

                $injector.get('$http')(response.config).then(function (resp) {
                  deferred.resolve(resp);
                }, function (err) {
                  deferred.reject(err);
                });
              } else {
                deferred.reject();
              }
            }, function (error) {
              inFlightAuthRequest = null;
              deferred.reject(error);
              AuthenticationService.logout();
              $injector.get('$state').go('explore.map');

            });

            return deferred.promise;
          case 400:
          case 404:
            return $q.reject(response);
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
