'use strict';

angular.module('openSenseMapApp')
	.controller('SidebarBoxDetailsCtrl',
		["$scope", "$stateParams", "$http", "OpenSenseBox", "OpenSenseBoxesSensors", "OpenSenseBoxAPI", "Validation", "ngDialog", "$timeout", "OpenSenseBoxData", "moment", function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, ngDialog, $timeout, OpenSenseBoxData, moment){

		$scope.osemapi = OpenSenseBoxAPI;
		$scope.true = true;

		OpenSenseBox.query({ boxId: $stateParams.id }, function(response){
			var markerLatLng = [
				response.loc[0].geometry.coordinates[1],
				response.loc[0].geometry.coordinates[0]
			];
			$scope.$parent.centerLatLng(markerLatLng);
			$scope.selectedMarker = response;
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

		$scope.getIcon = function(sensor) {
			if (sensor.icon !== undefined) {
				return sensor.icon;
			} else {
				if ((sensor.sensorType == 'BMP085' || sensor.sensorType == 'DHT11')  && sensor.title == 'Temperatur') {
					return 'wi wi-thermometer';
				} else if (sensor.sensorType == 'DHT11' || sensor.title == 'rel. Luftfeuchte' || sensor.title == 'Luftfeuchtigkeit') { 
					return 'wi wi-sprinkle';
				} else if (sensor.sensorType == 'LM386') {
					return 'fa fa-volume-up fa-fw';
				} else if (sensor.sensorType == 'BMP085' && sensor.title == 'Luftdruck') {
					return 'fa fa-tachometer fa-fw';
				} else if (sensor.sensorType == 'GL5528' || sensor.sensorType == 'TSL2561') {
					return 'fa fa-lightbulb-o fa-fw';
				} else if (sensor.sensorType == 'GUVA-S12D') {
					return 'fa fa-google-wallet fa-fw';
				} else {
					return 'fa fa-bar-chart fa-fw';
				}
			}
		};

		/* CHARTS */
		$scope.columns = [];
		$scope.sensordata = {};
		$scope.chartDone = {};
		$scope.chartError = {};
		$scope.getData = function(sensorId, panelOpen){
			if(!panelOpen) return; // panel is in closing transition, don't fetch new data
			var initDate = new Date();
			var endDate = '';
			var box = $scope.selectedMarker._id;
			$scope.chartDone[sensorId] = false;
			$scope.chartError[sensorId] = false;

			// Get the date of the last taken measurement for the selected sensor
			for (var i = 0; i < $scope.selectedMarkerData.sensors.length; i++){
				if(sensorId === $scope.selectedMarkerData.sensors[i]._id){
					var title = $scope.selectedMarkerData.sensors[i].title.toString().replace(".","");

					$scope.columns[sensorId] = [{"id": title, "type": "scatter"}, {"id": "dates", "type": "date"}];
					$scope.sensordata[sensorId] = [];

					if(!$scope.selectedMarkerData.sensors[i].lastMeasurement) {
						continue;
					}
					endDate = $scope.selectedMarkerData.sensors[i].lastMeasurement.createdAt;

					OpenSenseBoxData.query({boxId:box, sensorId: sensorId, date1: '', date2: endDate})
					.$promise.then(function(response){
						for (var j = 0; j < response.length; j++) {
							var d = new Date(response[j].createdAt);
							var dataPair = {};
							dataPair[title] = parseFloat(response[j].value);
							dataPair.dates = d;
							$scope.sensordata[sensorId].push(dataPair);
						}
						$scope.chartDone[sensorId] = true;
					}, function(error){
						$scope.chartError[sensorId] = true;
						$scope.chartDone[sensorId] = true;
					});
				}
			}
		};

		$scope.formatDate = function(input){
			return d3.time.format("%Y-%m-%d")(new Date(input));
		};
		$scope.formatDateFull = function(input){
			return d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(input));
		};
}]);
