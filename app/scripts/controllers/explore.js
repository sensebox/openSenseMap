'use strict';

angular.module('openSenseMapApp')
  .controller('ExploreCtrl', [ '$scope', '$timeout', 'OpenSenseBoxes', 'OpenSenseBoxesSensors', 'leafletEvents',
    function($scope, $timeout, OpenSenseBoxes, OpenSenseBoxesSensors, leafletEvents) {

      $scope.selectedMarker = '';
      $scope.selectedMarkerData = {};
      $scope.markers = [];
      $scope.pagedMarkers = [];
      $scope.prom;
      $scope.delay = 60000;

      $scope.sidebarActive = false;
      $scope.sidebarList = false;
      $scope.sidebarDetails = false;
      $scope.editIsCollapsed = true;
      $scope.deleteIsCollapsed = true;

      var icons = {
        iconC: {
          type: 'awesomeMarker',
          prefix: 'fa',
          icon: 'cube',
          markerColor: 'red',
        },
      };

      $scope.closeSidebar = function() {
        $scope.sidebarActive = false;
        $scope.sidebarList = false;
        $scope.sidebarDetails = false;
        $scope.editIsCollapsed = true;
        $scope.deleteIsCollapsed = true;
        $scope.selectedMarker = '';
        $scope.stopit();
      }

      $scope.collapse = function(panel) {
        switch(panel) {
          case 'edit':
            $scope.editIsCollapsed = !$scope.editIsCollapsed;
            $scope.deleteIsCollapsed = true;
            $scope.editableForm.show = true;
            break;
          case 'delete':
            $scope.editIsCollapsed = true;
            $scope.deleteIsCollapsed = !$scope.deleteIsCollapsed;
            break;
          default:
            break;
        }
      }

      $scope.checkName = function(data) {
        if (data == '') {
          return "";
        }
      };

      //Create our own control for listing
      var listControl = L.control();
      listControl.setPosition('topleft');
      listControl.onAdd = function () {
        var className = 'leaflet-control-my-location',
            container = L.DomUtil.create('div', className + ' leaflet-bar leaflet-control');
        var link = L.DomUtil.create('a', ' ', container);
        link.href = '#';
        L.DomUtil.create('i','fa fa-list fa-lg', link);

        L.DomEvent
          .on(link, 'click', L.DomEvent.preventDefault)
          .on(link, 'click', function(){
            $scope.sidebarActive = true;
            $scope.sidebarDetails = false;
            $scope.sidebarList = true;
          });

        return container;
      };

      //adds the controls to our map
      $scope.controls = {
        custom: [ listControl ]
      };

      //helper function to zoomTo object for filter sidebar
      $scope.zoomTo = function(lat,lng) {
        $scope.center.lat = lat;
        $scope.center.lng = lng;
        $scope.center.zoom = 15;
      };

      $scope.center = {
        lat: 51.04139389812637,
        lng: 10.21728515625,
        zoom: 6
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

      $scope.formatTime = function(time) {
        $scope.date = new Date(time);
        $scope.currentTime = new Date();
        $scope.difference = Math.round(($scope.currentTime-$scope.date)/60000);
        return $scope.difference;
      };

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        console.log(args);
        $scope.sidebarActive = true;
        $scope.sidebarDetails = true;
        $scope.sidebarList = false;
        $scope.selectedMarker = $scope.markers[args.markerName];
        $scope.getMeasurements();
        $scope.center.lat = args.leafletEvent.target._latlng.lat;
        $scope.center.lng = args.leafletEvent.target._latlng.lng;
        $scope.center.zoom = 15;
      });

      OpenSenseBoxes.query(function(response){
        console.log(response);
        for (var i = 0; i <= response.length - 1; i++) {
          var tempMarker = {};
          tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
          tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
          tempMarker.id = response[i]._id;
          tempMarker.icon = icons.iconC;
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
        OpenSenseBoxesSensors.query({boxId:$scope.selectedMarker.id}, function(response) {
          $scope.selectedMarkerData = response;
        });
      };
    }]);