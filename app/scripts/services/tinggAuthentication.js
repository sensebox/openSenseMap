(function () {
    'use strict';
  
    angular
      .module('app.services')
      .factory('TinggAuthenticationService', TinggAuthenticationService);
  
      TinggAuthenticationService.$inject = ['$window', 'LocalStorageService'];
  
    function TinggAuthenticationService ($window, LocalStorageService) {
      var service = {
        parseJwt: parseJwt,
        saveToken: saveToken,
        getToken: getToken,
      };
  
      return service;
  
      ////
  
      function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
  
        return JSON.parse($window.atob(base64));
      }
  
      function saveToken (token) {
        LocalStorageService.setValue('tingg_acess_token', token);
      }

      function getToken(){
        return LocalStorageService.get('tingg_access_token');
        }

  
  

    }
  })();
  