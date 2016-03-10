'use strict';

angular.module('openSenseMapApp')
	.controller('SidebarFilterCtrl', 
		['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'filterFilter', '$timeout', '$filter',
		function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, filterFilter, $timeout, $filter){

		//$scope.date = new Date('2016-03-07T00:11:30.780Z');
		//$scope.dateMax = new Date($scope.date.getTime()+(3600*24*1000)).getTime();
		//$scope.dateMin = new Date($scope.date.getTime()-(3600*24*1000)).getTime();
		$scope.date = new Date();
		$scope.dateMax = $scope.date.getTime();
		$scope.dateMin = new Date($scope.date.getTime()-(1000*3600*24*90)).getTime();
		$scope.daterange = $scope.dateMin;

		$scope.filterByDate = function(box) {
				return box.station.sensors.some(function(cv, i, arr){
					return cv.lastMeasurement && 
							cv.lastMeasurement.updatedAt && 
							Date.parse(cv.lastMeasurement.updatedAt) > $scope.daterange
				});
		};
		
		$scope.performFilter = function(){
			var nameexpr = { station: { name: $scope.searchText } };
			console.log($scope.daterange);
			var date = new Date($scope.daterange*1);
			$scope.$parent.fetchMarkers(date.toISOString(), "Temperatur");
			$scope.$parent.markersFiltered = filterFilter($scope.$parent.markers, nameexpr);
			//$scope.$parent.markersFiltered = $filter('filter')($scope.$parent.markersFiltered, $scope.filterByDate);
		};

		var _timeout;
		$scope.liveSearch = function() {
			if(_timeout){
				$timeout.cancel(_timeout);
			}
			_timeout = $timeout(function(){
				$scope.performFilter();
				_timeout = null;
			}, 500);
		};

		$scope.resetFilter = function(){
			$scope.searchText = "";
			$scope.$parent.fetchMarkers("", "");
		};
}]);