(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = ['$window'];

  function AuthenticationService ($window) {
    var service = {
      parseJwt: parseJwt,
      saveToken: saveToken,
      saveRefreshToken: saveRefreshToken,
      getToken: getToken,
      getRefreshToken: getRefreshToken,
      logout: logout
    }

    return service;

    ////

    function parseJwt (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    }

    function saveToken (token) {
      $window.localStorage['osem_access_token'] = token;
    }

    function saveRefreshToken (token) {
      $window.localStorage['osem_refresh_token'] = token;
    }

    function getToken () {
      return $window.localStorage['osem_access_token'];
    }

    function getRefreshToken () {
      return $window.localStorage['osem_refresh_token'];
    }

    function logout () {
      $window.localStorage.removeItem('osem_access_token');
      $window.localStorage.removeItem('osem_refresh_token');
    }
  }
})();
