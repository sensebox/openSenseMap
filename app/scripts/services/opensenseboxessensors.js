'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxesSensors', ["$resource", "OpenSenseBoxAPI", function ($resource, OpenSenseBoxAPI) {
    return $resource(OpenSenseBoxAPI.url+'/boxes/:boxId/sensors', {}, {'query': {method: 'GET', isArray: false}});
  }]);