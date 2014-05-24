'use strict';

angular.module('openSenseMapApp')
  .factory('OpenSenseBoxes', function ($resource) {
    return $resource('http://opensensemap.org:8000/boxes', {});
  });
