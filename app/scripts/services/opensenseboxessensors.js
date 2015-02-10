'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxesSensors', function ($resource) {
    return $resource('http://opensensemap.org:8000/boxes/:boxId/sensors', {}, {'query': {method: 'GET', isArray: false}});
  });