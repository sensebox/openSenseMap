(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .factory('SignupLoginService', SignupLoginService);

  SignupLoginService.$inject = ['$http', 'OpenSenseBoxAPI', 'AuthenticationService'];

  function SignupLoginService ($http, OpenSenseBoxAPI, AuthenticationService) {
    var service = {
      signup: signup,
      login: login,
      logout: logout,
      requestReset: requestReset,
      reset: reset,
      isAuthed: isAuthed
    };

    return service;

    ////

    function success (response) {
      console.log(response);
      AuthenticationService.saveToken(response.data.token);
      console.log(AuthenticationService.parseJwt(response.data.token));
      return response;
    }

    function failed (error) {
      console.log(error);
    }

    function signup (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/register', data)
        .then(success)
        .catch(failed);
    }

    function login (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/sign-in', data)
        .then(success)
        .catch(failed);
    }

    function logout () {
      return $http.post(OpenSenseBoxAPI.url + '/users/sign-out')
        .then(function (response) {
          AuthenticationService.logout && AuthenticationService.logout();
        })
        .catch(failed);
    }

    function requestReset (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/request-password-reset', data)
        .then(function (response) {
          console.log(response);
          return response;
        })
        .catch(failed);
    }

    function reset (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/password-reset', data)
        .then(function (response) {
          console.log(response);
          return response;
        })
        .catch(failed);
    }

    function isAuthed () {
      var token = AuthenticationService.getToken();
      if(token) {
        var params = AuthenticationService.parseJwt(token);
        return Math.round(new Date().getTime() / 1000) <= params.exp;
      } else {
        return false;
      }
    }
  }
})();
