'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.validation
 * @description
 * # validation
 * Factory in the openSenseMapApp.
 */
angular.module('openSenseMapApp')
  .factory('validation', function ($http, $q) {

    var service = {};

    var validApiKey = function (boxId, apiKey) {
      return $http({
        method: 'GET',
        url: 'http://localhost:8000/users/'+boxId,
        headers: {
          'X-ApiKey':apiKey
        }
      });
    };

    service.checkApiKey = function (boxId, apiKey) {
      var http = validApiKey(boxId,apiKey);
      var deferred = $q.defer();
      http.
        success( function (data, status) {
          deferred.resolve(status);
        }).
        error( function (data, status) {
          deferred.resolve(status);
        });
      return deferred.promise;
    };

    return service;
  });
