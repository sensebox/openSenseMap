(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .factory('OpenSenseMapData', OpenSenseMapData);

  OpenSenseMapData.$inject = ['$q', '$state'];

  function OpenSenseMapData ($q, $state) {
    var markers = {};
    var ONE_DAY = 1000 * 60 * 60 * 24;
    var SEVEN_DAYS = ONE_DAY * 7;
    var THIRTY_DAYS = ONE_DAY * 30;

    var service = {
      getMarkers: getMarkers,
      setMarkers: setMarkers,
      getMarker: getMarker
    };

    return service;

    ////

    function getMarkers () {
      return markers;
    }

    function getMarker (boxId) {
      for (var box in markers) {
        if (angular.equals(markers[box].station.id, boxId)) {
          return markers[box];
        }
      }
    }

    function setMarkers (data, classification) {
      if (angular.isUndefined(classification)) {
        classification = true;
      }
      var deferred = $q.defer();
      var newMarkers = {};
      var classifiedMarker;
      if (classification) {
        classifiedMarker = data.map(classify);
      } else {
        classifiedMarker = data;
      }

      if (classifiedMarker) {
        for (var i = classifiedMarker.length - 1; i >= 0; i--) {
          var id = makeid();
          newMarkers[id] = classifiedMarker[i];
        }
        markers = newMarkers;
        deferred.resolve(markers);
      } else {
        deferred.reject('Error while classifying markers');
      }
      return deferred.promise;
    }

    // returns a markerconfiguration, and grades the color based on
    // activity state of the box
    function makeMarkerOpts (color, state) {
      var layer = state + 'Marker', opacity, zIndexOffset;
      switch (state) {
        case 'active':
          opacity = 1;
          zIndexOffset = 200;
          break;
        case 'inactive':
          opacity = 0.65;
          zIndexOffset = 100;
          color = 'dark' + color;
          break;
        case 'old':
          opacity = 0.5;
          zIndexOffset = 0;
          color = 'lightgray';
          break;
        case 'hidden':
          opacity = 0;
          zIndexOffset = 300;
          color = 'lightgray';
        default:
          break;
      }

      return { layer, opacity, zIndexOffset, marker: {
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: 'cube',
        markerColor: color,
        opacity,
        zIndexOffset,
      }};
    }

    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    function classify (obj) {
      // decide wheter a box is active, inactive or "dead" by looking at the most recent last measurement's date
      var now = Date.now();
      var markerOpts = obj.sensors.reduceRight(function (previous, sensor, index) {
        if (sensor.lastMeasurement && sensor.lastMeasurement.createdAt) {

            var createdAt = Date.parse(sensor.lastMeasurement.createdAt);

            // if its 'old' try to determine if other sensors are newer..
            if (previous === 'old' && (now - createdAt < THIRTY_DAYS)) {
              previous = 'inactive';
            }

            // if its 'inactive' try to determine if other sensors are newer..
            if (previous === 'inactive' && (now - createdAt < SEVEN_DAYS)) {
              previous = 'active';
            }
        }

        if (index === 0) { //finally return the correct options
          var color = obj.exposure === 'mobile' ? 'blue' : 'green';
          return makeMarkerOpts(color, previous);
        } else { // else just return the state of the previous sensor
          return previous;
        }
      }, 'old');

      // override marker icon for mobile boxes
      if (obj.exposure === 'mobile') {
        markerOpts.marker.icon = 'rocket';
      }

      var marker = {
        layer: markerOpts.layer,
        icon: markerOpts.marker,
        lng: obj.currentLocation.coordinates[0],
        lat: obj.currentLocation.coordinates[1],
        opacity: markerOpts.opacity,
        riseOnHover: true,
        station: {
          id: obj._id,
          name: obj.name,
          exposure: obj.exposure,
          grouptag: obj.grouptag,
          sensors: obj.sensors,
          model: obj.model
        },
        zIndexOffset: markerOpts.zIndexOffset
      };
      return marker;
    }
  }
})();
