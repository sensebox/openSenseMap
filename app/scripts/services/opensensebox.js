'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.OpenSenseBox
 * @description
 * # OpenSenseBox
 * Factory in the openSenseMapApp.
 */
angular.module('openSenseMapApp')
  .factory('OpenSenseBox', function ($resource) {
    return $resource('http://localhost:8000/boxes/:boxId', {}, {'query': {method: 'GET', isArray: false}});
  });
