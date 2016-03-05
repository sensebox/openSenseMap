'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarFilterCtrl', 
  	['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'filterFilter', '$timeout', '$filter',
  	function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, filterFilter, $timeout, $filter){

  	$scope.date = new Date();
  	$scope.dateMax = Date.now();
  	$scope.dateMin = Date.now()-(60*60*24*365*3*1000);
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
    	$scope.$parent.markersFiltered = filterFilter($scope.$parent.markers, nameexpr);
    	$scope.$parent.markersFiltered = $filter('filter')($scope.$parent.markersFiltered, $scope.filterByDate);
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
}]);