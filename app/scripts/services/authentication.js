(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = ['$window', 'LocalStorageService'];

  function AuthenticationService ($window, LocalStorageService) {
    var service = {
      parseJwt: parseJwt,
      saveToken: saveToken,
      saveRefreshToken: saveRefreshToken,
      saveUser: saveUser,
      getToken: getToken,
      getRefreshToken: getRefreshToken,
      getUser: getUser,
      logout: logout
    };

    return service;

    ////

    function parseJwt (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');

      return JSON.parse($window.atob(base64));
    }

    function saveToken (token) {
      LocalStorageService.setValue('osem_access_token', token);
    }

    function saveRefreshToken (token) {
      LocalStorageService.setValue('osem_refresh_token', token);
    }

    function saveUser (user) {
      LocalStorageService.setValue('osem.account', user);
    }

    function getToken () {
      return LocalStorageService.getValue('osem_access_token');
    }

    function getRefreshToken () {
      return LocalStorageService.getValue('osem_refresh_token');
    }

    function getUser () {
      return LocalStorageService.getValue('osem.account');
    }

    function logout () {
      LocalStorageService.removeValue('osem_access_token');
      LocalStorageService.removeValue('osem_refresh_token');
      LocalStorageService.removeValue('osem.account');
    }
  }
})();
