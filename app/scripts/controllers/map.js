(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope', '$state', '$timeout', '$templateRequest', '$compile', 'boxes', 'OpenSenseMapData', 'osemMapData'];

  function MapController ($scope, $state, $timeout, $templateRequest, $compile, boxes, OpenSenseMapData, osemMapData) {
    var vm = this;
    vm.showAllMarkers = true;
    vm.showHide = false;
    vm.cssClass = '';

    vm.mapMarkers = {};

    vm.hoverlabel = {
      left: 0,
      top: 0,
      name: ''
    };

    vm.toggleLegend = toggleLegend;
    vm.toggleLayer = toggleLayer;

    activate();

    ////

    function activate () {
      OpenSenseMapData.setMarkers(boxes)
        .then(function (response) {
          vm.mapMarkers = response;
        })
        .catch(function (error) {
          console.error(error);
        });
    }

    function toggleLegend ($event) {
      var zoomControl = document.getElementsByClassName('leaflet-top leaflet-left');
      if (vm.showHide) {
        vm.cssClass = '';
        if (document.body.clientHeight <= 400 ) {
          zoomControl[0].classList.remove('hidden');
        }
      } else {
        vm.cssClass = 'legend-big';
        if (document.body.clientHeight <= 400 ) {
          zoomControl[0].classList.add('hidden');
        }
      }
      vm.showHide = !vm.showHide;
    }

    function toggleLayer (type, event) {
      osemMapData.getMap('map_main')
        .then(function (map) {
          osemMapData.getLayer('oldMarkers')
            .then(function (layer) {
              if (map.hasLayer(layer)) {
                if (!vm.showAllMarkers) {
                  map.removeLayer(layer);
                }
              } else {
                map.addLayer(layer);
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
      event.stopPropagation();
    }

    ////

    $scope.$on('osemMarkerMouseOver.map_main', function (e, args) {
      var markerBounds = args.target._icon.getBoundingClientRect();
      vm.hoverlabel = {
        left: markerBounds.left+'px',
        top: (markerBounds.top-33)+'px',
        name: args.target.options.options.station.name
      };
    });

    $scope.$on('osemMarkerMouseOut.map_main', function (e, args) {
      vm.hoverlabel = {
        left: 0,
        top: 0,
        name: ''
      };
    });

    $scope.$on('osemMarkerClick.map_main', function (e, args) {
      $state.go('explore.map.boxdetails', { id: args.target.options.options.station.id });
    })

    $scope.$on('markersChanged', function (data) {
      vm.mapMarkers = OpenSenseMapData.getMarkers();
    });

    $scope.$on('osemMapReady', function () {
      /* Custom legend control */
      osemMapData.getMap('map_main').then(function (map) {
        var info = L.control({ position:'bottomleft' });
        info.onAdd = function () {
          var _div = L.DomUtil.create('div', 'leaflet-bar leaflet-control'); // create a div with a class "info"
          this._div = _div;
          $templateRequest('views/explore2.map.legend.html').then(function(html) {
            var template = angular.element(html);
            var infoDiv = angular.element(_div);
            var infoContainer = angular.element(info._container);
            infoDiv.append(template);
            infoContainer.append(template);
            $compile(template)($scope);
          });
          this._div.onclick = vm.toggleLegend;
          return this._div;
        };
        map.addControl(info);
      })
      .catch(function (error) {
        console.log(error);
      });
    })
  }
})();
