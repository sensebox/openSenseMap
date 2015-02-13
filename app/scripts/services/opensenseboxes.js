'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxes', function ($resource) {
    return $resource('http://localhost:8000/boxes', {});
  });