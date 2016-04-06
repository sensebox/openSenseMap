'use strict';

angular.module('openSenseMapApp')
	.controller('SidebarFilterCtrl', 
		['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'filterFilter', '$timeout', '$filter', 'phenomenonsFilter',
		function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, filterFilter, $timeout, $filter, phenomenonsFilter){

		// form user inputs:
		// $scope.inputFilterName
		// $scope.inputFilterGrouptag
		// $scope.inputFilterDateFrom
		// $scope.inputFilterDateTo
		// $scope.inputFilterExposure
		// $scope.inputFilterPhenomenon

		//$scope.date = new Date();
		//$scope.dateMax = $scope.date.getTime();
		//$scope.dateMin = new Date($scope.date.getTime()-(1000*3600*24*90)).getTime();
		//$scope.inputFilterDate = $scope.dateMin;

		$scope.filterByDate = function(box) {
				return box.station.sensors.some(function(cv, i, arr){
					return cv.lastMeasurement && 
							cv.lastMeasurement.updatedAt && 
							Date.parse(cv.lastMeasurement.updatedAt) > $scope.inputFilterDate
				});
		};
		
		$scope.performFilter = function(){
			console.log($scope.inputFilterDateFrom);
			var nameexpr = { 
				station: { 
					name: $scope.inputFilterName, 
					grouptag: $scope.inputFilterGrouptag,
					exposure: $scope.inputFilterExposure
				} 
			};
			if($scope.inputFilterName !== '' || $scope.inputFilterGrouptag !== '' || $scope.inputFilterExposure !== '') $scope.$parent.markersFiltered = filterFilter($scope.$parent.markersFiltered, nameexpr);
			if($scope.inputFilterPhenomenon !== '') $scope.$parent.markersFiltered = phenomenonsFilter($scope.$parent.markersFiltered, $scope.inputFilterPhenomenon);
			if($scope.inputFilterDateTo !== '' && $scope.inputDateFrom !== '') $scope.$parent.fetchMarkers([$scope.inputFilterDateFrom.toISOString(), $scope.inputFilterDateTo.toISOString()], "");
		};

		/*
			Wait 500ms after each additional change/input and then execute the search 
		*/
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
			$scope.inputFilterName = "";
			$scope.inputFilterGrouptag = "";
			$scope.inputFilterDateFrom = "";
			$scope.inputFilterDateTo = "";
			$scope.inputFilterExposure = "";
			$scope.inputFilterPhenomenon = "";
			//$scope.$parent.fetchMarkers("", "");
		};
		$scope.refreshData = function(){
			$scope.$parent.fetchMarkers("", "");
		}
		$scope.resetFilter();

		$scope.openDatepicker = function($event) {
	        $event.preventDefault();
	        $event.stopPropagation();

	        // prevent both date pickers from being opened at the same time
	        if($event.currentTarget.id === "datepicker1") {
	          $scope.opened1 = true;
	          $scope.opened2 = false;
	        } else if($event.currentTarget.id === "datepicker2") {
	          $scope.opened2 = true;
	          $scope.opened1 = false;
	        }
      	};
}]);