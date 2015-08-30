'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxData', function ($resource, OpenSenseBoxAPI){
    return $resource(OpenSenseBoxAPI.url+'/boxes/:boxId/data/:sensorId?from-date=:date1&to-date=:date2',{},{'query': {method: 'GET', isArray: true}});
  });
