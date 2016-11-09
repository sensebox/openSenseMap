'use strict';

angular.module('openSenseMapApp')
	.controller('SidebarFilterCtrl', 
		["$scope", "$stateParams", "$http", "OpenSenseBox", "OpenSenseBoxesSensors", "OpenSenseBoxAPI", "Validation", "filterFilter", "$timeout", "$filter", "phenomenonsFilter", "boxFilter", "FilterActiveService", function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, filterFilter, $timeout, $filter, phenomenonsFilter, boxFilter, FilterActiveService){

		$scope.filterActive = FilterActiveService;

		// form user inputs:
		// $scope.inputFilter.Name
		// $scope.inputFilter.Grouptag
		// $scope.inputFilter.DateFrom
		// $scope.inputFilter.DateTo
		// $scope.inputFilter.Exposure
		// $scope.inputFilter.Phenomenon
		$scope.inputFilter = $scope.inputFilter || {};

		if($scope.inputFilter.DateTo && $scope.inputFilter.DateTo !== '' && $scope.inputFilter.DateFrom && $scope.inputFilter.DateFrom !== '') $scope.needsRefresh = true;

		$scope.filterByDate = function(box) {
				return box.station.sensors.some(function(cv, i, arr){
					return cv.lastMeasurement && 
							cv.lastMeasurement.updatedAt && 
							Date.parse(cv.lastMeasurement.updatedAt) > $scope.inputFilter.Date
				});
		};
		
		$scope.endingDate = function(numDays){
			$scope.inputFilter.DateTo = new Date();
			$scope.inputFilter.DateFrom = new Date((new Date()).valueOf() - 1000*60*60*24*numDays);
			$scope.needsRefresh = true;
		};
		
		$scope.performFilter = function(){
			$scope.filterActive.active = true;
			var nameexpr = { 
				station: { 
					name: $scope.inputFilter.Name, 
					grouptag: $scope.inputFilter.Grouptag,
					exposure: $scope.inputFilter.Exposure
				} 
			};
			if($scope.needsRefresh && $scope.inputFilter.DateTo && $scope.inputFilter.DateTo !== '' && $scope.inputFilter.DateFrom && $scope.inputFilter.DateFrom !== '') $scope.$parent.fetchMarkers([$scope.inputFilter.DateFrom.toISOString(), $scope.inputFilter.DateTo.toISOString()], $scope.inputFilter.Phenomenon, true);
			if($scope.inputFilter.Name !== '' || $scope.inputFilter.Grouptag !== '' || $scope.inputFilter.Exposure !== '') $scope.$parent.markersFiltered = boxFilter($scope.$parent.markers, nameexpr);
			if($scope.inputFilter.Phenomenon !== '') $scope.$parent.markersFiltered = phenomenonsFilter($scope.$parent.markersFiltered, $scope.inputFilter.Phenomenon);
			$scope.needsRefresh = false;
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
			$scope.filterActive.active = false;
		};

		$scope.refreshData = function(){
			$scope.$parent.fetchMarkers("", "");
		};

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

      	$scope.checkPhenomNeedsRefresh = function(){
      		if(($scope.inputFilter.DateFrom && $scope.inputFilter.DateFrom !== '') || ($scope.inputFilter.DateTo && $scope.inputFilter.DateTo !== '')) {
      			$scope.needsRefresh=true;
      		} else {
      			$scope.performFilter();
      		}
      	};
}]);