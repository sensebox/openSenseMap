'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxes', ['$resource', 'OpenSenseBoxAPI', function ($resource, OpenSenseBoxAPI) {
      return $resource(OpenSenseBoxAPI.url+'/boxes', { date: '@date', phenomenon: '@phenomenon' }, {
      	query: { method: 'get', isArray: true }
      });
    }]);
