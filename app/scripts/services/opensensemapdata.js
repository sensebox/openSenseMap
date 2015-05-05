'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxData', function ($resource){
  	return $resource('http://opensensemap.org:8002/boxes/:boxId/data/:sensorId?from-date=:date1&to-date=:date2',{},{'query': {method: 'GET', isArray: true}});
  });
