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
      makeMarkerOptions: classify,
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
    function makeLayerOpts (color, icon, state) {
      var COLORS = {
        blue: '#38AADD',
        darkblue: '#0067A3',
        green: '#72B026',
        darkgreen: '#728224',
        lightgray: '#575757',
      };

      var origColor = color, layerName = state + 'Markers', opacity, zIndexOffset;

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

      return {
        layerName: layerName,
        // returns the color independent of state
        modelColor: {
          name: origColor,
          opacity: 1,
          hex: COLORS[origColor],
        },
        color: {
          name: color,
          opacity: opacity,
          hex: COLORS[color],
        },
        icon: L.AwesomeMarkers.icon({
          type: 'awesomeMarker',
          prefix: 'fa',
          icon: icon,
          markerColor: color,
          opacity: opacity,
          zIndexOffset: zIndexOffset
        }),
        opacity: opacity,
        raiseOnHover: true,
        zIndexOffset: zIndexOffset
      };
    }

    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    function classify (box) {
      // decide wheter a box is active, inactive or "dead" by looking at the most recent last measurement's date
      var now = Date.now();
      var markerOpts = box.sensors.reduceRight(function (previous, sensor, index) {
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
        } else {
          console.warn('no lastMeasurement, cannot classify box');
        }

        if (index === 0) { //finally return the correct options
          var color = box.exposure === 'mobile' ? 'blue' : 'green';
          var icon = box.exposure === 'mobile' ? 'rocket' : 'cube';
          return makeLayerOpts(color, icon, previous);
        } else { // else just return the state of the previous sensor
          return previous;
        }
      }, 'old');

      markerOpts.station = box;
      markerOpts.latLng = [
        box.currentLocation.coordinates[1],
        box.currentLocation.coordinates[0],
      ];

      return markerOpts;
    }
  }
})();
