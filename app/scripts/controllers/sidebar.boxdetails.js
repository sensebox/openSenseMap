'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarBoxDetailsCtrl', 
  	['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'ngDialog', '$timeout', 'OpenSenseBoxData',
  	function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, ngDialog, $timeout, OpenSenseBoxData){

  	$scope.osemapi = OpenSenseBoxAPI;
    $scope.true = true;
 	
  	OpenSenseBox.query({ boxId: $stateParams.id }, function(response){
  		$scope.selectedMarker = response;
      $scope.$parent.center = {
        lng: response.loc[0].geometry.coordinates[0],
        lat: response.loc[0].geometry.coordinates[1],
        zoom: 14
      };
  	}, function(error){
      $scope.boxNotFound = true;
    });
  	OpenSenseBoxesSensors.query({ boxId: $stateParams.id }, function(response) {
		  $scope.selectedMarkerData = response;
    });

    $scope.openEditDialog = function () {
      $scope.launchTemp = ngDialog.open({
        template: '/views/editbox.html',
        className: 'ngdialog-theme-default',
        scope: $scope,
        showClose: true,
        closeByDocument: false,
        controller: 'EditboxCtrl'
      });
    };


    /* CHARTS */

    $scope.colums = [{"id": "data", "type": "scatter"}, {"id": "dates", "type": "date"}];
    $scope.mydata = {};
    $scope.chartDone = {};
    $scope.getData = function(sensorId, panelOpen){
      if(!panelOpen) return;

      var initDate = new Date();
      var endDate = '';
      var box = $scope.selectedMarker._id;
      
      // Get the date of the last taken measurement for the selected sensor
      for (var i = 0; i < $scope.selectedMarker.sensors.length; i++){
        if(sensorId === $scope.selectedMarker.sensors[i]._id){
          //$scope.mydata[sensorId] = [{ 'data': [], 'dates': [] }];
          $scope.mydata[sensorId] = [];
          $scope.chartDone[sensorId] = false;
          
          if(!$scope.selectedMarker.sensors[i].lastMeasurement) {
            continue;
          }
          endDate = $scope.selectedMarker.sensors[i].lastMeasurement.createdAt;
          //console.log($scope.selectedMarker);

          OpenSenseBoxData.query({boxId:box, sensorId: sensorId, date1: '', date2: endDate})
          .$promise.then(function(response){
            for (var j = 0; j < response.length; j++) {
              var d = new Date(response[j].createdAt);
              $scope.mydata[sensorId].push( { 'data': parseFloat(response[j].value), 'dates': d } );
              //$scope.mydata[sensorId][0].data.push( parseFloat(response[j].value) );
              //$scope.mydata[sensorId][0].dates.push( response[j].createdAt );
                /*Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds())
              );*/
            }
            $scope.chartDone[sensorId] = true;
          });
        }
      }
    };

    $scope.formateDate = function(input){
      //console.log(input);
      return d3.time.format("%Y-%m-%d")(new Date(input));
    };
}]);