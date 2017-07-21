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
        markers: '=',
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

      var markers = L.layerGroup();
      var oldMarkers = L.layerGroup();

      oldMarkers.on('add', function () {
        osemMapData.setLayer('oldMarkers', oldMarkers);
      });

      markers.on('add', function () {
        osemMapData.setLayer('markers', markers);
      });

      L.tileLayer('@@OPENSENSEMAP_MAPTILES_URL', {
        subdomains: 'abc',
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        detectRetina: true,
        reuseTiles: true,
        maxZoom: 18
      }).addTo(map);

      L.control.scale().addTo(map);

      map.addLayer(markers);
      map.addLayer(oldMarkers);

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
        scope.$watch('markers', function (newVal, oldVal) {
          if (angular.isDefined(newVal) && !angular.equals({}, newVal)) {
            markers.clearLayers();
            oldMarkers.clearLayers();
            for (var marker in newVal) {
              var box = newVal[marker];
              var boxMarker = L.AwesomeMarkers.icon({
                icon: 'cube',
                prefix: 'fa',
                markerColor: box.icon.markerColor
              });
              boxMarker.opacity = 0.5;
              var marker = L.marker([box.lat,box.lng], {icon: boxMarker, options: box, draggable: box.draggable, opacity: box.icon.opacity, zIndexOffset: box.icon.zIndexOffset});
              if (box.layer === 'oldMarker') {
                oldMarkers.addLayer(marker);
              } else {
                markers.addLayer(marker);
              }
              marker.on('click', onMarkerClick);
              marker.on('mouseover', onMouseOver);
              marker.on('mouseout', onMouseOut);

              if (box.draggable) {
                marker.on('dragend', onMarkerDragend);
              }
            }
          }
        });

        $rootScope.$broadcast('osemMapReady', {});
      });

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
