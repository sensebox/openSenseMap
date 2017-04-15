(function () {
  'use strict';

  angular
    .module('app.services', [])
    .factory('AccountService', AccountService);

  AccountService.$inject = ['$http', '$q', 'OpenSenseBoxAPI', 'AuthenticationService'];

  function AccountService ($http, $q, OpenSenseBoxAPI, AuthenticationService) {
    var service = {
      signup: signup,
      login: login,
      logout: logout,
      requestReset: requestReset,
      reset: reset,
      isAuthed: isAuthed,
      getUserDetails: getUserDetails,
      getUsersBoxes: getUsersBoxes,
      updateAccount: updateAccount,
      confirmEmail: confirmEmail
    };

    return service;

    ////

    function success (response) {
      AuthenticationService.saveToken(response.data.token);
      AuthenticationService.saveRefreshToken(response.data.refreshToken);
      return response.data;
    }

    function failed (error) {
      return $q.reject(error.data);
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
          return response;
        })
        .catch(failed);
    }

    function reset (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/password-reset', data)
        .then(function (response) {
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

    function getUserDetails () {
      return $http.get(OpenSenseBoxAPI.url + '/users/me')
        .then(getUserDetailsComplete)
        .catch(getUserDetailsFailed);

      function getUserDetailsComplete (response) {
        return response.data;
      }

      function getUserDetailsFailed (error) {
        return $q.reject(error.data);
      }
    }

    function getUsersBoxes () {
      return $http.get(OpenSenseBoxAPI.url + '/users/me/boxes')
        .then(getUsersBoxesComplete)
        .catch(getUsersBoxesFailed);

      function getUsersBoxesComplete (response) {
        return response.data;
      }

      function getUsersBoxesFailed (error) {
        return $q.reject(error.data);
      }
    }

    function updateAccount (data) {
      return $http.put(OpenSenseBoxAPI.url + '/users/me', data)
        .then(updateAccountComplete)
        .catch(updateAccountFailed);

      function updateAccountComplete (response) {
        return response.data;
      }

      function updateAccountFailed (error) {
        return $q.reject(error.data);
      }
    }

    function confirmEmail (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/confirm-email', data)
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }
  }
})();
