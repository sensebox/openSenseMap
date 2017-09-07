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
    // the following get filled from childscope sidebar.boxdetails.js
    // IDEA: pass this data via $scope.$parent.$broadcast() instead?
    vm.boxLocations = {};
    vm.selectedSensorMeasurements = [];
    vm.legendInfo = {};
    vm.highlightedMeasure = undefined;

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

    function createLegendFromTemplate (templateURI, clickHandler) {
      var legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function () {
        var _div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        this._div = _div;
        $templateRequest(templateURI)
          .then(function(html) {
            var template = angular.element(html);
            var infoDiv = angular.element(_div);
            var infoContainer = angular.element(legend._container);
            infoDiv.append(template);
            infoContainer.append(template);
            $compile(template)($scope);
          });

        this._div.onclick = clickHandler;
        return this._div;
      };

      return legend;
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
          osemMapData.getLayer(type)
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

    function resetHoverlabel() {
      vm.hoverlabel = { left: 0, top: 0, name: '' };
    }

    ////

    $scope.$on('osemMeasurementMouseOver.map_main', function (e, args) {
      vm.hoverlabel = {
        left: (args.containerPoint.x + 10) + 'px',
        top:  (args.containerPoint.y - 43) + 'px',
        name: args.target.options.hoverlabelContent
      };
    });

    $scope.$on('osemMarkerMouseOver.map_main', function (e, args) {
      var markerBounds = args.target._icon.getBoundingClientRect();
      vm.hoverlabel = {
        left: markerBounds.left+'px',
        top: (markerBounds.top-33)+'px',
        name: args.target.options.options.station.name
      };
    });

    $scope.$on('osemMarkerMouseOut.map_main', resetHoverlabel);
    $scope.$on('osemMeasurementMouseOut.map_main', resetHoverlabel);

    $scope.$on('osemMarkerClick.map_main', function (e, args) {
      $state.go('explore.map.boxdetails', { id: args.target.options.options.station.id });
    })

    $scope.$on('markersChanged', function (data) {
      vm.mapMarkers = OpenSenseMapData.getMarkers();
    });

    $scope.$on('osemMapReady', function () {
      /* Custom legend control */
      osemMapData.getMap('map_main').then(function (map) {
        var infoLegend = createLegendFromTemplate('views/explore2.map.legend.html', vm.toggleLegend);
        map.addControl(infoLegend);
        var measurementLegend = createLegendFromTemplate('views/explore2.map.legend.measurements.html');
        map.addControl(measurementLegend);
      })
      .catch(function (error) {
        console.log(error);
      });
    });
  }
})();
