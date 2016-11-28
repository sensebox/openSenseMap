'use strict';

angular.module('openSenseMapApp')
	.controller('SidebarBoxDetailsCtrl',
		['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'ngDialog', '$timeout', 'OpenSenseBoxData', function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, ngDialog, $timeout, OpenSenseBoxData){

		$scope.osemapi = OpenSenseBoxAPI;
		$scope.true = true;
		$scope.prom;
		$scope.delay = 60000;

		var getMeasurements = function () {
			$scope.prom = $timeout(getMeasurements, $scope.delay);
			OpenSenseBoxesSensors.query({ boxId: $stateParams.id }, function(response) {
				if ($scope.selectedMarkerData === undefined) {
					$scope.selectedMarkerData = response;
				} else {
					$scope.selectedMarkerData.sensors.map(function (value) {
						for (var i = 0; i < response.sensors.length; i++) {
							if (value._id === response.sensors[i]._id && value.lastMeasurement !== undefined) {
								angular.extend(value.lastMeasurement, response.sensors[i].lastMeasurement);
							}
						}
					});
				}
			});
		};

		OpenSenseBox.query({ boxId: $stateParams.id }, function(response){
			var markerLatLng = [
				response.loc[0].geometry.coordinates[1],
				response.loc[0].geometry.coordinates[0]
			];
			$scope.$parent.centerLatLng(markerLatLng);
			$scope.selectedMarker = response;
			getMeasurements();
		}, function(){
			$scope.boxNotFound = true;
		});

		$scope.closeSidebar = function () {
			$timeout.cancel($scope.prom);
		};

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
				if ((sensor.sensorType === 'HDC1008' || sensor.sensorType === 'DHT11')  && sensor.title === 'Temperatur') {
					return 'osem-thermometer';
				} else if (sensor.sensorType === 'HDC1008' || sensor.title === 'rel. Luftfeuchte' || sensor.title === 'Luftfeuchtigkeit') {
					return 'osem-humidity';
				} else if (sensor.sensorType === 'LM386') {
					return 'osem-volume-up';
				} else if (sensor.sensorType === 'BMP280' && sensor.title === 'Luftdruck') {
					return 'osem-barometer';
				} else if (sensor.sensorType === 'TSL45315' || sensor.sensorType === 'VEML6070') {
					return 'osem-brightness';
				} else {
					return 'osem-dashboard';
				}
			}
		};

		/* CHARTS */
		$scope.columns = [];
		$scope.sensordata = {};
		$scope.chartDone = {};
		$scope.chartError = {};
		$scope.getData = function(sensorId, panelOpen){
			if(!panelOpen) {
				return; // panel is in closing transition, don't fetch new data
			}
			var endDate = '';
			var box = $scope.selectedMarker._id;
			$scope.chartDone[sensorId] = false;
			$scope.chartError[sensorId] = false;

			// Get the date of the last taken measurement for the selected sensor
			for (var i = 0; i < $scope.selectedMarkerData.sensors.length; i++){
				if(sensorId === $scope.selectedMarkerData.sensors[i]._id){
					var title = $scope.selectedMarkerData.sensors[i].title.toString().replace('.','');

					$scope.columns[sensorId] = [{'id': title, 'type': 'scatter'}, {'id': 'dates', 'type': 'date'}];
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
					}, function(){
						$scope.chartError[sensorId] = true;
						$scope.chartDone[sensorId] = true;
					});
				}
			}
		};

		$scope.formatDate = function(input){
			return d3.time.format('%Y-%m-%d')(new Date(input));
		};
		$scope.formatDateFull = function(input){
			return d3.time.format('%Y-%m-%d %H:%M:%S')(new Date(input));
		};
}]);
