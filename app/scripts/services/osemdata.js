(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .factory('OpenSenseMapData', OpenSenseMapData);

  OpenSenseMapData.$inject = ['$q'];

  function OpenSenseMapData ($q) {
    var markers = {};

    var service = {
      makeMarkerOptions: classify,
      getMarkers: getMarkers,
      setMarkers: setMarkers,
      getMarker: getMarker,
      justSetMarkers: justSetMarkers
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

    function justSetMarkers (data) {
      markers = data;
    }

    function setMarkers (data, classification) {
      var deferred = $q.defer();
      setTimeout(function () {
        var newMarkers = {};
        var classifiedMarker;
        classifiedMarker =  data.map(classify);

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
      }, 50);
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
      var color = box.exposure === 'mobile' ? 'blue' : 'green';
      var icon = box.exposure === 'mobile' ? 'rocket' : 'cube';
      var markerOpts = makeLayerOpts(color, icon, box.state);

      markerOpts.station = box;
      markerOpts.latLng = [
        box.currentLocation.coordinates[1],
        box.currentLocation.coordinates[0],
      ];

      return markerOpts;
    }
  }
})();
