(function () {
  'use strict';

  angular
    .module('app.services', [])
    .factory('AccountService', AccountService);

  AccountService.$inject = ['$http', '$q', '$window', 'moment', 'app', 'AuthenticationService', 'Box'];

  function AccountService ($http, $q, $window, moment, app, AuthenticationService, Box) {
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
      deleteMeasurement: deleteMeasurement,
      postNewBox: postNewBox,
      deleteAccount: deleteAccount,
      compileSketch: compileSketch,
      transferDevice: transferDevice,
      revokeToken: revokeToken,
      getTransferToken: getTransferToken
    };

    return service;

    ////

    function success (response) {
      AuthenticationService.saveToken(response.data.token);
      AuthenticationService.saveRefreshToken(response.data.refreshToken);
      AuthenticationService.saveUser(JSON.stringify(response.data.data.user));

      return response.data;
    }

    function failed (error) {
      return $q.reject(error.data);
    }

    function signup (data) {
      return $http.post(app.API_URL + '/users/register', data)
        .then(success)
        .catch(failed);
    }

    function login (data) {
      return $http.post(app.API_URL + '/users/sign-in', data)
        .then(success)
        .catch(failed);
    }

    function logout () {
      return $http.post(app.API_URL + '/users/sign-out', {}, { auth: true })
        .then(function () {
          AuthenticationService.logout && AuthenticationService.logout();
        })
        .catch(failed);
    }

    function requestReset (data) {
      return $http.post(app.API_URL + '/users/request-password-reset', data)
        .then(function (response) {
          return response;
        })
        .catch(failed);
    }

    function reset (data) {
      return $http.post(app.API_URL + '/users/password-reset', data)
        .then(function (response) {
          return response;
        })
        .catch(failed);
    }

    function isAuthed () {
      var token = AuthenticationService.getToken();
      if (token) {
        var params = AuthenticationService.parseJwt(token);

        return moment.utc() <= moment.utc(params.exp * 1000);
      }

      return false;

    }

    function refreshAuth () {
      var data = {
        token: AuthenticationService.getRefreshToken()
      };

      return $http.post(app.API_URL + '/users/refresh-auth', data)
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
      return $http.get(app.API_URL + '/users/me', { auth: true })
        .then(getUserDetailsComplete)
        .catch(getUserDetailsFailed);

      function getUserDetailsComplete (response) {
        AuthenticationService.saveUser(JSON.stringify(response.data.data.me));

        return response.data;
      }

      function getUserDetailsFailed (error) {
        return $q.reject(error.data);
      }
    }

    function getUsersBoxes () {
      return $http.get(app.API_URL + '/users/me/boxes', { auth: true })
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
      return $http.put(app.API_URL + '/users/me', data, { auth: true })
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
      return $http.put(app.API_URL + '/boxes/' + boxId, data, { auth: true })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function getScript (boxId, data) {
      return $http.get(app.API_URL + '/boxes/' + boxId + '/script', { auth: true, params: data })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function confirmEmail (data) {
      return $http.post(app.API_URL + '/users/confirm-email', data)
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function deleteBox (boxId, data) {
      return $http.delete(app.API_URL + '/boxes/' + boxId,
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

    function deleteMeasurement (boxId, sensorId, data) {
      return $http.delete(app.API_URL + '/boxes/' + boxId + '/' + sensorId + '/measurements',
        {
          data: data,
          auth: true,
          headers: {
            'Content-type': 'application/json; charset=utf-8'
          }
        })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function postNewBox (data) {
      return $http.post(app.API_URL + '/boxes', data, { auth: true })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function deleteAccount (data) {
      return $http.delete(app.API_URL + '/users/me',
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

    function compileSketch (data) {
      return $http.post('https://compiler.sensebox.de/compile', data)
        .then(function (response) {
          var url = encodeURI('https://compiler.sensebox.de/download?id=' + response.data.data.id + '&board=sensebox-mcu');

          return $window.open(url, '_self');
        })
        .catch(failed);
    }

    function getTransferToken (boxId) {
      return $http
        .get(app.API_URL + '/boxes/transfer/' + boxId, {
          auth: true,
        })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function transferDevice (data) {
      return $http.post(app.API_URL + '/boxes/transfer', data, {
        auth: true,
      })
        .then(function (response) {
          return response.data;
        })
        .catch(failed);
    }

    function revokeToken (data) {
      return $http
        .delete(app.API_URL + '/boxes/transfer', {
          auth: true,
          data: data,
          headers: {
            'Content-type': 'application/json;charset=utf-8',
          },
        })
        .then(function (response) {
          return response;
        })
        .catch(failed);
    }
  }
})();
