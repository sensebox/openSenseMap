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
    vm.markersWatchOptions = {
      doWatch: false,
      isDeep: false,
      individual: {
        doWatch: false,
        isDeep: false
      }
    };

    vm.controls = {
      scale: true
    };

    vm.layers = {
      baselayers: {
        mapbox: {
          name: 'Mapbox Streets',
          type: 'xyz',
          url: '@@OPENSENSEMAP_MAPTILES_URL',
          layerOptions: {
            subdomains: ['a', 'b', 'c'],
            detectRetina: true,
            reuseTiles: true,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
            showOnSelector: false,
            maxZoom: 18
          }
        }
      },
      overlays: {
        activeMarker: {
          type: 'group',
          name: 'activeMarker',
          visible: true
        },
        inactiveMarker: {
          type: 'group',
          name: 'inactiveMarker',
          visible: true
        },
        oldMarker: {
          type: 'group',
          name: 'oldMarker',
          visible: true
        },
        // create inivisible markers for filtering/sorting because of a bug in angular-directive: need to keep the marker ordering in the array
        // https://github.com/tombatossals/angular-leaflet-directive/issues/512
        // https://github.com/tombatossals/angular-leaflet-directive/issues/1041
        hiddenMarker: {
          type: 'group',
          name: 'hiddenMarker',
          visible: false
        }
      }
    };

    vm.markers = {};
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
      vm.layers.overlays[type].visible = !vm.layers.overlays[type].visible;
      event.stopPropagation();
    }

    ////

    $scope.$on('leafletDirectiveMarker.map_main.mouseover', function (e, args){
      var markerBounds = args.leafletEvent.target._icon.getBoundingClientRect();
      vm.hoverlabel = {
        left: markerBounds.left+'px',
        top: (markerBounds.top-33)+'px',
        name: args.leafletEvent.target.options.station.name
      };
    });

    $scope.$on('leafletDirectiveMarker.map_main.mouseout', function (){
      vm.hoverlabel = {
        left: 0,
        top: 0,
        name: ''
      };
    });

    /*
      When you click on a map marker, the sidebar will open with more possibilities/details for this station
    */
    $scope.$on('leafletDirectiveMarker.map_main.click', function(e, args) {
      // Args will contain the marker name and other relevant information
      centerLatLng(args.leafletEvent.target._latlng);
      $state.go('explore.map.boxdetails', { id: args.leafletEvent.target.options.station.id });
    });

    $scope.$on('markersChanged', function (data) {
      vm.mapMarkers = OpenSenseMapData.getMarkers();
    });
  }
})();
