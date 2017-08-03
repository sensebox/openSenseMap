(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemMap', osemMap);

  osemMap.$inject = ['$q', '$rootScope', 'osemMapData'];

  /* @ngInject */
  function osemMap ($q, $rootScope, osemMapData) {
    var directive = {
      templateUrl: 'components/leaflet.directive.html',
      link: link,
      restrict: 'EA',
      transclude: true,
      controller: function () {
        this._leafletMap = $q.defer();
        this.getMap = function () {
          return this._leafletMap.promise;
        };
      },
      scope: {
        markers: '=',            // expects an array of classified markers
        mobileTrajectory: '=',   // expects geojson linestring
        mobileMeasurements: '=', // expects array of API measurements
        center: '=',
        events: '='
      }
    };
    return directive;

    function link(scope, element, attrs, ctrl) {
      //TODO: destroy
      scope.mapId =  attrs.id;

      var map = new L.map(element[0], {
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
        scrollWheelZoom: true
      }).setView([51.04139389812637, 10.2172851562], 6);
      ctrl._leafletMap.resolve(map);

      map.on('click', onMapClick);

      var mapLayers = {
        'markers': L.layerGroup(),
        'oldMarkers': L.layerGroup(),
        'mobileTrajectory': L.layerGroup(),
        'mobileMeasurements': L.layerGroup(),
      };

      for (var layerName in mapLayers) {
        osemMapData.setLayer(layerName, mapLayers[layerName]);
        map.addLayer(mapLayers[layerName]);
      }

      L.tileLayer('@@OPENSENSEMAP_MAPTILES_URL', {
        subdomains: 'abc',
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        detectRetina: true,
        reuseTiles: true,
        maxZoom: 18
      }).addTo(map);

      L.control.scale().addTo(map);

      if (angular.isDefined(scope.events) && !angular.equals({}, scope.events)) {
        if (scope.events.autolocation) {
          map.locate({setView: true, maxZoom: 16});
          map.on('locationfound', onLocationFound);
          map.on('locationerror', onLocationError);
        }
      }

      // Resolve the map object to the promises
      map.whenReady(function() {
        osemMapData.setMap(attrs.id, map);
        // set up watches, which generate map objects from the watched raw data
        scope.$watch('markers', onMarkersWatch);
        scope.$watch('mobileTrajectory', onTrajectoryWatch);
        scope.$watch('mobileMeasurements', onMeasurementsWatch);
        $rootScope.$broadcast('osemMapReady', {});
      });

      function onMarkersWatch (newVal, oldVal) {
        if (angular.isDefined(newVal) && !angular.equals({}, newVal)) {
          mapLayers['markers'].clearLayers();
          mapLayers['oldMarkers'].clearLayers();
          for (var marker in newVal) {
            var box = newVal[marker];
            var marker = L.marker([box.lat,box.lng], {
              icon: L.AwesomeMarkers.icon(box.icon),
              options: box,
              draggable: box.draggable,
              opacity: box.icon.opacity,
              zIndexOffset: box.icon.zIndexOffset});
            if (box.layer === 'oldMarker') {
              mapLayers['oldMarkers'].addLayer(marker);
            } else {
              mapLayers['markers'].addLayer(marker);
            }
            marker.on('click', onMarkerClick);
            marker.on('mouseover', onMouseOver);
            marker.on('mouseout', onMouseOut);

            if (box.draggable) {
              marker.on('dragend', onMarkerDragend);
            }
          }
        }
      }

      function onTrajectoryWatch (newVal, oldVal) {
        mapLayers['mobileTrajectory'].clearLayers();
        if (!angular.isDefined(newVal) || angular.equals({}, newVal)) return;

        // swap latLngs
        var latlngs = newVal.geometry.coordinates.map(function (latlng) {
          return [latlng[1], latlng[0], latlng[3]];
        });

        var line = L.polyline(latlngs, {
          color: '#333',
          opacity: 0.7,
          weight: 2,
          //dashArray: '5',
          interactive: false
        });

        mapLayers['mobileTrajectory'].addLayer(line);
      }

      function onMeasurementsWatch (newVal, oldVal) {
        mapLayers['mobileMeasurements'].clearLayers();
        if (!angular.isDefined(newVal) || angular.equals({}, newVal)) return;

        // find min & max values for color grading
        var values = newVal.map(function(m) { return m.value; });
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);
        var palette = chroma.scale(['#B5F584', '#375F73']).mode('hcl').correctLightness().domain([max, min]);

        for (var measure of newVal) {
          // swap latlngs
          var latlng = [measure.location[1], measure.location[0], measure.location[3]];

          var marker = L.circleMarker(latlng, {
            radius: 6,
            weight: 0.3,
            color: '#222',
            fillOpacity: 1,
            fillColor: palette(measure.value)
          });

          mapLayers['mobileMeasurements'].addLayer(marker);
        }
      }

      function onLocationFound (e) {
        var eventName = 'osemMapOnLocationFound.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onLocationError (e) {
        var eventName = 'osemMapOnLocationError.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMapClick (e) {
        var eventName = 'osemMapClick.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMarkerDragend (e) {
        var eventName = 'osemMarkerDragend.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMouseOver (e) {
        var eventName = 'osemMarkerMouseOver.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMouseOut (e) {
        var eventName = 'osemMarkerMouseOut.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMarkerClick (e) {
        var eventName = 'osemMarkerClick.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
      }
    }
  }
})();
