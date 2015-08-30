'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxesSensors', function ($resource, OpenSenseBoxAPI) {
    return $resource(OpenSenseBoxAPI.url+'/boxes/:boxId/sensors', {}, {'query': {method: 'GET', isArray: false}});
  });