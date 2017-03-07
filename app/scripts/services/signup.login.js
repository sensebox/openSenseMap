(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .factory('SignupLoginService', SignupLoginService);

  SignupLoginService.$inject = ['$http', 'OpenSenseBoxAPI'];

  function SignupLoginService ($http, OpenSenseBoxAPI) {
    var service = {
      signup: signup,
      login: login
    };

    return service;

    ////

    function signup (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/register', data)
        .then(success)
        .catch(failed);

        function success (response) {
          console.log(response);
          return response;
        }

        function failed (error) {
          console.log(error);
        }
    }

    function login (data) {
      return $http.post(OpenSenseBoxAPI.url + '/users/sign-in', data)
        .then(success)
        .catch(failed);

        function success (response) {
          console.log(response);
          return response;
        }

        function failed (error) {
          console.log(error);
        }
    }
  }
})();
