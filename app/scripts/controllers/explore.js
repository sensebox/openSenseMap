'use strict';

angular.module('openSenseMapApp')
  .controller('ExploreCtrl', [ '$scope', '$timeout', 'OpenSenseBoxes', 'OpenSenseBoxesSensors', 'leafletEvents',
    function($scope, $timeout, OpenSenseBoxes, OpenSenseBoxesSensors, leafletEvents) {
      $scope.mapView = true;
      $scope.listView = false;
      $scope.splitView = false;
      $scope.selectedMarker = '';
      $scope.selectedMarkerData = {};
      $scope.markers = [];
      $scope.pagedMarkers = [];
      $scope.prom;
      $scope.delay = 60000;

      $scope.center = {
        // autoDiscover: true,
        lat: 40.095,
        lng: -3.823,
        zoom: 4
      };

      $scope.defaults = {
        tileLayer: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true,
        },
        scrollWheelZoom: false
      };

      $scope.itemsPerPage = 8;
      $scope.totalItems = $scope.markers.length;
      $scope.bigCurrentPage = 1;
      $scope.maxSize = 5;

      $scope.from = 0;
      $scope.to = 8;

      $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        if (pageNo !== 1) {
          $scope.to = 8 * pageNo;
          $scope.from = $scope.to-8;
        } else {
          $scope.from = 0;
          $scope.to = 8;
        }
        $scope.pagedMarkers = $scope.markers.slice($scope.from,$scope.to);
      };

      $scope.changeView = function(view) {
        if (view === 'list') {
          $scope.mapView = false;
          $scope.listView = true;
          $scope.totalItems = $scope.markers.length;
          if ($scope.pagedMarkers) {
            $scope.pagedMarkers = $scope.markers.slice($scope.from,$scope.to);
          }
          $scope.stopit();
          $scope.splitView = false;
        }
        if (view === 'map') {
          $scope.mapView = true;
          $scope.listView = false;
        }
      };

      $scope.formatTime = function(time) {
        $scope.date = new Date(time);
        $scope.currentTime = new Date();
        $scope.difference = Math.round(($scope.currentTime-$scope.date)/60000);
        return $scope.difference;
      };

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        $scope.splitView = true;
        $scope.selectedMarker = args.leafletEvent.target.options.title;
        $scope.getMeasurements();
        $scope.center.lat = args.leafletEvent.target._latlng.lat;
        $scope.center.lng = args.leafletEvent.target._latlng.lng;
        $scope.center.zoom = 15;
      });

      OpenSenseBoxes.query(function(response){
        for (var i = response.length - 1; i >= 0; i--) {
          var tempMarker = {};
          tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
          tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
          tempMarker.title = response[i]._id;
          tempMarker.name = response[i].name;
          $scope.markers.push(tempMarker);
        }
      });

      $scope.stopit = function() {
        $timeout.cancel($scope.prom);
      };

      $scope.clickcounter = 0;

      $scope.getMeasurements = function() {
        console.log('I am watching');
        $scope.prom = $timeout($scope.getMeasurements, $scope.delay);
        OpenSenseBoxesSensors.query({boxId:$scope.selectedMarker}, function(response) {
          $scope.selectedMarkerData = response;
        });
      };
    }]);