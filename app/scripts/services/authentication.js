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
      getToken: getToken,
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
      $window.localStorage['jwtToken'] = token;
    }

    function getToken () {
      return $window.localStorage['jwtToken'];
    }

    function logout () {
      $window.localStorage.removeItem('jwtToken');
    }
  }
})();
