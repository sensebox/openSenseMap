(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('AccountService', AccountService);

  AccountService.$inject = ['$http', '$q', 'moment', 'AuthenticationService', 'Box', 'config'];

  function AccountService ($http, $q, moment, AuthenticationService, Box, config) {
    var service = {
      signup: signup,
      login: login,
      logout: logout,
      requestReset: requestReset,
      reset: reset,
      isAuthed: isAuthed,
      refreshAuth: refreshAuth,
      refreshTokenExists: refreshTokenExists,
      getUserDetails: getUserDetails,
      getUsersBoxes: getUsersBoxes,
      getScript: getScript,
      updateAccount: updateAccount,
      updateBox: updateBox,
      confirmEmail: confirmEmail,
      deleteBox: deleteBox,
      postNewBox: postNewBox,
      deleteAccount: deleteAccount
    };

    return service;

    ////

    function getUrl () {
      return config.appApiUrl;
    }

    function success (response) {
      AuthenticationService.saveToken(response.data.token);
      AuthenticationService.saveRefreshToken(response.data.refreshToken);
      return response.data;
    }

    function failed (error) {
      return $q.reject(error.data);
    }

    function signup (data) {
      return $http.post(getUrl() + '/users/register', data)
        .then(success)
        .catch(failed);
    }

    function login (data) {
      return $http.post(getUrl() + '/users/sign-in', data)
        .then(success)
        .catch(failed);
    }

    function logout () {
      return $http.post(getUrl() + '/users/sign-out', {}, {auth: true})
        .then(function (response) {
          AuthenticationService.logout && AuthenticationService.logout();
        })
        .catch(failed);
    }

    function requestReset (data) {
      return $http.post(getUrl() + '/users/request-password-reset', data)
        .then(function (response) {
          return response;
        })
        .catch(failed);
    }

    function reset (data) {
      return $http.post(getUrl() + '/users/password-reset', data)
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

      return $http.post(getUrl() + '/users/refresh-auth', data)
        .then(success)
        .catch(refreshAuthFailed);

        function refreshAuthFailed (error) {
          AuthenticationService.logout && AuthenticationService.logout();
          return $q.reject(error);
        }
    }

    function refreshTokenExists () {
      return angular.isDefined(AuthenticationService.getRefreshToken());
    }

    function getUserDetails () {
      return $http.get(getUrl() + '/users/me', {auth: true})
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
      return $http.get(getUrl() + '/users/me/boxes', {auth: true})
        .then(getUsersBoxesComplete)
        .catch(getUsersBoxesFailed);

      function getUsersBoxesComplete (response) {
        return response.data.data.boxes.map(function (b) {
          return new Box(b);
        });
      }

      function getUsersBoxesFailed (error) {
        return $q.reject(error.data);
      }
    }

    function updateAccount (data) {
      return $http.put(getUrl() + '/users/me', data, {auth: true})
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
      return $http.put(getUrl() + '/boxes/' + boxId, data, {auth: true})
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function getScript (boxId) {
      return $http.get(getUrl() + '/boxes/' + boxId + '/script', {auth: true})
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function confirmEmail (data) {
      return $http.post(getUrl() + '/users/confirm-email', data)
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function deleteBox (boxId, data) {
      return $http.delete(getUrl() + '/boxes/' + boxId,
        {
          auth: true,
          data: data,
          headers: {
            'Content-type': 'application/json;charset=utf-8'
          }
        })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function postNewBox (data) {
      return $http.post(getUrl() + '/boxes', data, {auth: true})
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function deleteAccount (data) {
      return $http.delete(getUrl() + '/users/me',
        {
          data: data,
          auth: true,
          headers: {
            'Content-type': 'application/json;charset=utf-8'
          }
        })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }
  }
})();
