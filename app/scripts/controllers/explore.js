'use strict';

angular.module('openSenseMapApp')
  .controller('ExploreCtrl', [ '$scope', '$http', '$filter', '$timeout', '$location', '$routeParams', 'OpenSenseBoxes', 'OpenSenseBoxesSensors', 'OpenSenseBox', 'leafletEvents', 'validation', 'ngDialog', 'leafletData',
    function($scope, $http, $filter, $timeout, $location, $routeParams, OpenSenseBoxes, OpenSenseBoxesSensors, OpenSenseBox, leafletEvents, Validation, ngDialog, leafletData) {
      $scope.isCollapsed = false;
      $scope.selectedMarker = '';
      $scope.selectedMarkerData = [];
      $scope.markers = [];
      $scope.mapMarkers = [];
      $scope.pagedMarkers = [];
      $scope.prom;
      $scope.delay = 60000;
      $scope.searchText = '';
      $scope.detailsPanel = false;
      $scope.filterPanel = false;
      $scope.image = "placeholder.png";

      $scope.center = {
        lat: 51.04139389812637,
        lng: 10.21728515625,
        zoom: 6
      };

      //helper function to zoomTo object for filter sidebar
      $scope.zoomTo = function(lat,lng) {
        $scope.center.lat = lat;
        $scope.center.lng = lng;
        $scope.center.zoom = 15;
      };

      $scope.added = function(file,event) {
        if ((file.getExtension() === "jpg" || file.getExtension() === "png" || file.getExtension() === "jpeg") && file.size < 1500000) {
          return true;
        } else {
          return false;
        }
      }

      if ($routeParams.boxid !== undefined) {
        //TODO find boxid
        OpenSenseBox.query({boxId:$routeParams.boxid}, function(response) {
          $scope.sidebarActive = true;
          $scope.detailsPanel = true;
          $scope.filterPanel = false;
          $scope.selectedMarker = response;
          if ($scope.selectedMarker.image === undefined || $scope.selectedMarker.image === "") {
            $scope.image = "placeholder.png";
          } else {
            $scope.image = $scope.selectedMarker.image;
          }
          $scope.getMeasurements();
          var lat = response.loc[0].geometry.coordinates[1];
          var lng = response.loc[0].geometry.coordinates[0];
          $scope.zoomTo(lat,lng);
        });
      }

      $scope.downloadArduino = function () {
        var boxId = "";
        if ($scope.selectedMarker.id === undefined) {
          boxId = $scope.selectedMarker._id;
        } else {
          boxId = $scope.selectedMarker.id;
        }
        Validation.checkApiKey(boxId,$scope.apikey.key).then(function(status){
          if (status === 200) {
            document.getElementById("downloadlink").href = "files/"+boxId+".ino";
            $timeout(function() {
              document.getElementById("downloadlink").click();
            }, 100);
            $scope.downloadArduino = false;
          } else {

          }
        });
      }

      $scope.tmpSensor = {};

      $scope.filterOpts = [
        {name:'Phänomen'},
        {name:'Name'},
      ];
      $scope.selectedFilterOption = 'Phänomen';

      $scope.sidebarActive = false;
      $scope.editIsCollapsed = false;
      $scope.deleteIsCollapsed = false;
      $scope.editableMode = false;

      var icons = {
        iconC: {
          type: 'awesomeMarker',
          prefix: 'fa',
          icon: 'cube',
          markerColor: 'red',
        },
      };

      $scope.openDialog = function () {
        ngDialog.open({
          template: '../../views/app_info_modal.html',
          className: 'ngdialog-theme-default',
          scope: $scope
        });
      }

      $scope.$watchCollection('searchText', function(newValue, oldValue){
        if (newValue === oldValue) {
          return;
        };

        var data = angular.copy($scope.markers);

        var justGroup = _.filter(data, function(x) {
          if ($scope.selectedFilterOption == "Phänomen") {
            if (newValue == '' | newValue == undefined) {
              if (!newValue) {
                return true;
              } else{
                for(var i in x.sensors) {
                  $filter('filter')([x.sensors[i].title], newValue).length > 0;
                }
              };
            } else {
              for(var i in x.sensors) {
                if ($filter('filter')([x.sensors[i].title], newValue).length > 0) {
                  return x;
                };
              }
            };
          } else if($scope.selectedFilterOption == "Name") {
            if (newValue == '' | newValue == undefined) {
              if (!newValue) {
                return true;
              } else{
                $filter('filter')([x.name], newValue).length > 0;
              };
            } else {
              if ($filter('filter')([x.name], newValue).length > 0) {
                return x;
              };
            };
          };

        });
        data = justGroup;
        $scope.mapMarkers = data;
      });

      $scope.closeSidebar = function() {
        $scope.sidebarActive = false;
        $scope.editIsCollapsed = false;
        $scope.deleteIsCollapsed = false;
        $scope.downloadIsCollapsed = false;
        $scope.selectedMarker = '';
        $scope.editableMode = false;
        $scope.apikey.key = '';
        $scope.stopit();
        $location.path('/explore', false);
      }

      $scope.saveChange = function (event) {
        if ($scope.selectedMarker.id !== undefined) {
          var boxid = $scope.selectedMarker.id;
        } else {
          var boxid = $scope.selectedMarker._id;
        };
        var imgsrc = angular.element(document.getElementById("image")).attr('src');
        $http.put('http://localhost:8000/boxes/'+boxid,{image:imgsrc},{headers: {'X-ApiKey':$scope.apikey.key}}).
          success(function(data,status){
            $scope.editableMode = !$scope.editableMode;
            $scope.selectedMarker = data;
            if (data.image === "") {
              $scope.image = "placeholder.png";
            } else {
              $scope.image = data.image;
            }

          }).
          error(function(data,status){

          });
      }

      $scope.discardChanges = function () {
        $scope.editableMode = !$scope.editableMode;
        $scope.selectedMarker = $scope.tmpSensor;
        $scope.image = $scope.tmpSensor.image;
      }

      $scope.deleteBox = function() {
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
            $scope.detailsPanel = false;
            $scope.filterPanel = true;
          });

        return container;
      };

      var geoCoderControl = L.Control.geocoder({
        position: 'topleft'
      });

      geoCoderControl.markGeocode = function (result) {
        leafletData.getMap().then(function(map) {
          map.fitBounds(result.bbox);
        });
      }

      //adds the controls to our map
      $scope.controls = {
        custom: [ listControl, geoCoderControl ]
      };

      $scope.apikey = {};
      $scope.enableEditableMode = function () {
        var boxId = "";
        if ($scope.selectedMarker.id === undefined) {
          boxId = $scope.selectedMarker._id;
        } else {
          boxId = $scope.selectedMarker.id;
        }
        Validation.checkApiKey(boxId,$scope.apikey.key).then(function(status){
          if (status === 200) {
            $scope.editableMode = !$scope.editableMode;
            $scope.editIsCollapsed = false;
            $scope.tmpSensor = angular.copy($scope.selectedMarker);
          } else {
            $scope.editableMode = false;
          }
        });
      }

      $scope.defaults = {
        tileLayer: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true,
        },
        scrollWheelZoom: true
      };

      $scope.formatTime = function(time) {
        $scope.date = new Date(time);
        $scope.currentTime = new Date();
        $scope.difference = Math.round(($scope.currentTime-$scope.date)/60000);
        return $scope.difference;
      };

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        // console.log(args);
        $scope.sidebarActive = true;
        $scope.detailsPanel = true;
        $scope.filterPanel = false;
        $scope.selectedMarker = $scope.filteredMarkers[args.markerName];
        if ($scope.selectedMarker.image === undefined || $scope.selectedMarker.image === "") {
          $scope.image = "placeholder.png";
        } else {
          $scope.image = $scope.selectedMarker.image;
        }
        $scope.getMeasurements();
        $scope.center.lat = args.leafletEvent.target._latlng.lat;
        $scope.center.lng = args.leafletEvent.target._latlng.lng;
        $scope.center.zoom = 15;
        $location.path('/explore/'+$scope.selectedMarker.id, false);
      });

      OpenSenseBoxes.query(function(response){
        for (var i = 0; i <= response.length - 1; i++) {
          var tempMarker = {};
          tempMarker.phenomenons = []
          tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
          tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
          tempMarker.id = response[i]._id;
          tempMarker.icon = icons.iconC;
          tempMarker.name = response[i].name;
          tempMarker.sensors = response[i].sensors;
          tempMarker.image = response[i].image;
          for (var j = response[i].sensors.length - 1; j >= 0; j--) {
            tempMarker.phenomenons.push(response[i].sensors[j].title);
          };
          $scope.markers.push(tempMarker);
        }
        $scope.mapMarkers = $scope.markers;
      });

      $scope.stopit = function() {
        $timeout.cancel($scope.prom);
      };

      $scope.clickcounter = 0;

      $scope.getMeasurements = function() {
        // console.log($scope.selectedMarker);
        var box = '';
        if ($scope.selectedMarker.id) {
          box = $scope.selectedMarker.id;
        } else {
          box = $scope.selectedMarker._id;
        }
        $scope.prom = $timeout($scope.getMeasurements, $scope.delay);
        OpenSenseBoxesSensors.query({boxId:box}, function(response) {
          $scope.selectedMarkerData = response;
          console.log($scope.selectedMarkerData);
        });
      };
    }]);