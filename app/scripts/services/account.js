(function () {
  'use strict';

  angular
    .module('app.services', [])
    .factory('AccountService', AccountService);

  AccountService.$inject = ['$http', '$q', 'moment', 'OpenSenseBoxAPI', 'AuthenticationService'];

  function AccountService ($http, $q, moment, OpenSenseBoxAPI, AuthenticationService) {
    var service = {
      signup: signup,
      login: login,
      logout: logout,
      requestReset: requestReset,
      reset: reset,
      isAuthed: isAuthed,
      refreshAuth: refreshAuth,
      getUserDetails: getUserDetails,
      getUsersBoxes: getUsersBoxes,
      getScript: getScript,
      updateAccount: updateAccount,
      updateBox: updateBox,
      confirmEmail: confirmEmail,
      deleteBox: deleteBox
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
        return moment.utc() <= moment.utc(params.exp * 1000);
      } else {
        return false;
      }
    }

    function refreshAuth () {
      var data = {
        token: AuthenticationService.getRefreshToken()
      };
      return $http.post(OpenSenseBoxAPI.url + '/users/refresh-auth', data)
        .then(success)
        .catch(function (error) {
          AuthenticationService.logout && AuthenticationService.logout();
          failed(error);
        });
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

    function updateBox (boxId, data) {
      return $http.put(OpenSenseBoxAPI.url + '/boxes/' + boxId, data)
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function getScript (boxId) {
      return $http.get(OpenSenseBoxAPI.url + '/boxes/' + boxId + '/script')
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function confirmEmail (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/confirm-email', data)
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function deleteBox (boxId) {
      return $http.delete(OpenSenseBoxAPI.url+'/boxes/' + boxId)
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }
  }
})();
