'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxData', function ($resource){
  	return $resource('http://opensensemap.org:8002/boxes/:boxId/data/:sensorId?from-date=2014-03-25&to-date=2015-04-26',{},{'query': {method: 'GET', isArray: true}});
  });
