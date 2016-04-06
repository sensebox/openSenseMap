'use strict';

angular.module('openSenseMapApp')
	.controller('SidebarFilterCtrl', 
		['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'filterFilter', '$timeout', '$filter', 'phenomenonsFilter', 'boxFilter',
		function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, filterFilter, $timeout, $filter, phenomenonsFilter, boxFilter){

		// form user inputs:
		// $scope.inputFilter.Name
		// $scope.inputFilter.Grouptag
		// $scope.inputFilter.DateFrom
		// $scope.inputFilter.DateTo
		// $scope.inputFilter.Exposure
		// $scope.inputFilter.Phenomenon
		$scope.inputFilter = $scope.inputFilter || {};

		$scope.filterByDate = function(box) {
				return box.station.sensors.some(function(cv, i, arr){
					return cv.lastMeasurement && 
							cv.lastMeasurement.updatedAt && 
							Date.parse(cv.lastMeasurement.updatedAt) > $scope.inputFilter.Date
				});
		};
		
		$scope.performFilter = function(){
			var nameexpr = { 
				station: { 
					name: $scope.inputFilter.Name, 
					grouptag: $scope.inputFilter.Grouptag,
					exposure: $scope.inputFilter.Exposure
				} 
			};
			if($scope.inputFilter.DateTo && $scope.inputFilter.DateTo !== '' && $scope.inputFilter.DateFrom && $scope.inputFilter.DateFrom !== '') $scope.$parent.fetchMarkers([$scope.inputFilter.DateFrom.toISOString(), $scope.inputFilter.DateTo.toISOString()], "");
			if($scope.inputFilter.Name !== '' || $scope.inputFilter.Grouptag !== '' || $scope.inputFilter.Exposure !== '') $scope.$parent.markersFiltered = boxFilter($scope.$parent.markers, nameexpr);
			if($scope.inputFilter.Phenomenon !== '') $scope.$parent.markersFiltered = phenomenonsFilter($scope.$parent.markersFiltered, $scope.inputFilter.Phenomenon);
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
			$scope.inputFilter.Name = "";
			$scope.inputFilter.Grouptag = "";
			$scope.inputFilter.DateFrom = "";
			$scope.inputFilter.DateTo = "";
			$scope.inputFilter.Exposure = "";
			$scope.inputFilter.Phenomenon = "";
			//$scope.$parent.fetchMarkers("", "");
		};
		$scope.refreshData = function(){
			$scope.$parent.fetchMarkers("", "");
		};
		//$scope.resetFilter();

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