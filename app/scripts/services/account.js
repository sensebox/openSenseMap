(function () {
  'use strict';

  angular
    .module('app.services', [])
    .factory('AccountService', AccountService);

  AccountService.$inject = ['$http', '$q', 'OpenSenseBoxAPI'];

  function AccountService ($http, $q, OpenSenseBoxAPI) {
    return {
      getUserDetails: getUserDetails,
      getUsersBoxes: getUsersBoxes,
      updateAccount: updateAccount
    };

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
  }
})();
