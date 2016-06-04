'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.OpenSenseBox
 * @description
 * # OpenSenseBox
 * Factory in the openSenseMapApp.
 */
angular.module('openSenseMapApp')
  .factory('OpenSenseBox', ["$resource", "OpenSenseBoxAPI", function ($resource, OpenSenseBoxAPI) {
      return $resource(OpenSenseBoxAPI.url+'/boxes/:boxId', {}, {'query': {method: 'GET', isArray: false}});
    }]);
