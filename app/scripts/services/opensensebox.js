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
    return $resource('http://opensensemap.org:8002/boxes/:boxId', {}, {'query': {method: 'GET', isArray: false}});
  });
