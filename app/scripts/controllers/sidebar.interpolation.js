'use strict';
ocpu.seturl("OPENCPU_ENDPOINT");

angular.module('openSenseMapApp')
.controller('InterpolationCtrl',
	["$scope", "$stateParams", "$http", "OpenSenseBox", "OpenSenseBoxesSensors", "OpenSenseBoxAPI", "leafletData", "$timeout", function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, leafletData, $timeout){

		$scope.inputFilter = $scope.inputFilter || {};
		$scope.Interp = {};
		if($scope.inputFilter.DateFrom && $scope.inputFilter.DateTo) {
			$scope.Interp.DateFrom = new Date($scope.inputFilter.DateFrom).getTime();
			$scope.Interp.DateTo = new Date($scope.inputFilter.DateTo).getTime();
		}

		var _timeout;
		$scope.liveSearch = function() {
			if(_timeout){
				$timeout.cancel(_timeout);
			}
			_timeout = $timeout(function(){
				var timestamp = new Date(parseInt($scope.Interp.DateSelect));
				$scope.$parent.fetchMarkers(timestamp.toISOString(), $scope.inputFilter.Phenomenon);
				_timeout = null;
			}, 500);
		};

		var imageBounds;
		var imageBoundsLegend;
		$scope.$parent.overlayImageLegend;
		$scope.$parent.ImageLegend;
		$scope.$parent.overlayImage;
		$scope.legend = false;
		$scope.idp = 0;
		$scope.idpPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		//console.log($scope.$parent.markersFiltered);

		var boxes;
		$scope.prepare = function() {
			$scope.failedCalc = false;
			boxes = [];
			angular.forEach($scope.$parent.markersFiltered, function(value, key) {
				var boxesJSON = {};
				for (var i = 0; i < value.station.sensors.length; i++) {
					if (value.station.sensors[i].lastMeasurement != null && value.station.hasOwnProperty('exposure') && value.station.exposure == 'outdoor' && value.station.sensors[i].title == $scope.inputFilter.Phenomenon) {
						boxesJSON.latitude = value.lat;
						boxesJSON.longitude = value.lng;
						boxesJSON.value = value.station.sensors[i].lastMeasurement.value;

						boxes.push(boxesJSON);
					};

				};
			});
			console.log(boxes);
		}


		$scope.makeIDW = function(){
			$scope.prepare();

			$scope.loading = true;
			if ($scope.$parent.overlayImage != null) {
				leafletData.getMap('map_main').then(function(map) {
					map.removeLayer($scope.$parent.overlayImage);
					map.removeLayer($scope.$parent.overlayImageLegend);
				});
			};

			var req2 = ocpu.rpc("imageBounds",{
				input : boxes
			}, function(outtxt){
				imageBounds = [[outtxt[0], outtxt[1]], [outtxt[2], outtxt[3]]];
				imageBoundsLegend = [[outtxt[0], outtxt[1] + 15], [outtxt[2], outtxt[3] + 15]];
			});

			var req = ocpu.call("inteRidwIdp", {

				input : boxes,
				x : $scope.idp

			}, function(session) {

				$scope.loading = false;

				leafletData.getMap('map_main').then(function(map) {
					$scope.$parent.overlayImage = L.imageOverlay(session.getFileURL("idw.png"), imageBounds);
					map.addLayer($scope.$parent.overlayImage);
					if ($scope.idp != 0) {
						//$scope.$parent.overlayImageLegend = L.imageOverlay(session.getFileURL("legend.png"), imageBoundsLegend);
						//map.addLayer($scope.$parent.overlayImageLegend);
						$scope.legend = true;
						$scope.$parent.ImageLegend = session.getFileURL("legend.png");
					};
				});

			}).fail(function(){
				console.log("R returned an error: " + req.responseText);
				$scope.failedCalc = true;
			});

		};

		$scope.makeTP = function(){
			$scope.prepare();

			$scope.loading = true;

			if ($scope.$parent.overlayImage != null) {
				leafletData.getMap('map_main').then(function(map) {
					map.removeLayer($scope.$parent.overlayImage);
					map.removeLayer($scope.$parent.overlayImageLegend);
				});
			};

			var req2 = ocpu.rpc("imageBounds",{
				input : boxes
			}, function(outtxt){
				imageBounds = [[outtxt[0], outtxt[1]], [outtxt[2], outtxt[3]]];
				imageBoundsLegend = [[outtxt[0], outtxt[1] + 15], [outtxt[2], outtxt[3] + 15]];
			});

			var req = ocpu.call("inteRtp", {

				input : boxes

			}, function(session) {

				$scope.loading = false;

				leafletData.getMap('map_main').then(function(map) {
					$scope.$parent.overlayImage = L.imageOverlay(session.getFileURL("idw.png"), imageBounds);
					map.addLayer($scope.$parent.overlayImage);
					//$scope.$parent.overlayImageLegend = L.imageOverlay(session.getFileURL("legend.png"), imageBoundsLegend);
					//map.addLayer($scope.$parent.overlayImageLegend);
					$scope.legend = true;
					$scope.$parent.ImageLegend = session.getFileURL("legend.png");
				});

			}).fail(function(){
				console.log("R returned an error: " + req.responseText);
				$scope.failedCalc = true;
			});
		};

	}]);
