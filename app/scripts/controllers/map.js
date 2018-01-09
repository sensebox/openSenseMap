(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope', '$state', '$timeout', '$document', '$templateRequest', '$compile', 'boxes', 'OpenSenseMapData', 'osemMapData', 'isMobile'];

  function MapController ($scope, $state, $timeout, $document, $templateRequest, $compile, boxes, OpenSenseMapData, osemMapData, isMobile) {
    var vm = this;
    vm.showAllMarkers = true;
    vm.showClustering = true;
    vm.showLegend = false;
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
    vm.toggleClustering = toggleClustering;

    activate();

    ////

    function activate () {
      if (boxes instanceof Error) {
        $state.go('explore.map.sidebar.error');
        return;
      }

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

    function toggleLegend (event, showLegend) {
      var zoomControl = document.getElementsByClassName('leaflet-top leaflet-left');
      if (angular.isDefined(showLegend)) {
        vm.cssClass = '';
        if (document.body.clientHeight <= 400 ) {
          zoomControl[0].classList.remove('hidden');
        }
        vm.showLegend = showLegend;
        event.stopPropagation();
      } else {
        vm.cssClass = 'legend-big';
        if (document.body.clientHeight <= 400 ) {
          zoomControl[0].classList.add('hidden');
        }
        vm.showLegend = true;
      }
    }

    function toggleLayer (type, event) {
      osemMapData.getLayers()
        .then(function(layers){
          osemMapData.getMap('map_main')
            .then(function(map){
              if (map.hasLayer(layers[type])) {
                map.removeLayer(layers[type]);
              } else {
                map.addLayer(layers[type]);
              }
            })
        });
    }

    function toggleClustering (event) {
      osemMapData.getLayers()
        .then(function(layers){
          osemMapData.getMap('map_main')
            .then(function(map){
              if (map.hasLayer(layers.markerCluster)) {
                map.removeLayer(layers.markerCluster);
                layers.activeMarkers.setParentGroupSafe(map);
                layers.inactiveMarkers.setParentGroupSafe(map);
                layers.oldMarkers.setParentGroupSafe(map);
              } else {
                layers.oldMarkers.setParentGroupSafe(layers.markerCluster);
                layers.inactiveMarkers.setParentGroupSafe(layers.markerCluster);
                layers.activeMarkers.setParentGroupSafe(layers.markerCluster);
                map.addLayer(layers.markerCluster);
              }
            })
        });
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
        name: args.target.options.station.name
      };
    });

    $scope.$on('osemMarkerMouseOut.map_main', resetHoverlabel);
    $scope.$on('osemMeasurementMouseOut.map_main', resetHoverlabel);
    $scope.$on('boxSelected', resetHoverlabel);

    $scope.$on('osemMarkerClick.map_main', function (e, args) {
      $state.go('explore.map.sidebar.boxdetails', { id: args.target.options.station._id });
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

        if (isMobile.phone || isMobile.tablet) {
          var element = $document[0].getElementsByClassName('leaflet-bottom leaflet-left');
          element[0].setAttribute("style", "bottom: 0px;");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    });
  }
})();
