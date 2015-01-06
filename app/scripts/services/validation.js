'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.validation
 * @description
 * # validation
 * Factory in the openSenseMapApp.
 */
angular.module('openSenseMapApp')
  .factory('validation', function ($http,$resource) {

    var validApiKey = function (boxId, apiKey) {
      var User = $resource('http://localhost:8000/users/:boxId', { }, {
        'query': {
          method: 'GET',
          isArray: true,
          withCredentials: true,
          headers: {
            'X-ApiKey':'asdasd'
          }
        }
      });
      return User;
    }

    return {
      checkApiKey: function (boxId, apiKey) {
        var test = validApiKey(boxId,apiKey);
        test.query({boxId:boxId}, function (response) {
          console.log(response);
        });
      }
    };
  });
