'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarDownloadCtrl', 
	['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxAPI', 'leafletData',
	function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxAPI, leafletData){

	$scope.markersFiltered = $scope.$parent.markersFiltered;
	$scope.$watch('$parent.loading', function() {
        $scope.markersFiltered = $scope.$parent.markersFiltered;
    });

	$scope.osemapi = OpenSenseBoxAPI;
	$scope.inputFilter = $scope.inputFilter || {};
	$scope.downloadform = {
		format: 'CSV',
		pleaseWait: false,
		emptyData: false,
		errorOccured: false
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

	$scope.endingDate = function(numDays){
		$scope.inputFilter.DateTo = new Date();
		$scope.inputFilter.DateFrom = new Date((new Date()).valueOf() - 1000*60*60*24*numDays);
	};

	leafletData.getMap("map_main").then(function(map) {
		$scope.count = $scope.countBbox(map).length;
		map.on('zoomend moveend', function(evt){
			$scope.count = $scope.countBbox(map).length;
		})
	});

	$scope.countBbox = function(map){
		var boxids = [];
		var bbox = map.getBounds();
		angular.forEach($scope.markersFiltered, function(marker, key) {
			if(bbox.contains([marker.lat, marker.lng])) {
				boxids.push(marker.station.id);
			}
		});
		return boxids;
	};

	$scope.dataDownload = function(){
		$scope.downloadform.pleaseWait = true;
		leafletData.getMap("map_main").then(function(map) {
			var boxids = $scope.countBbox(map);
			$http.post($scope.osemapi.url+'/boxes/data',{
				boxid: boxids.join(','),
				'to-date': $scope.inputFilter.DateTo,
				'from-date': $scope.inputFilter.DateFrom,
				phenomenon: $scope.inputFilter.Phenomenon
			})
			.success(function(data) {
				console.log(data.length);
				if(data.length>0){
					var blob = new Blob([data],{type:'text/csv'});
					var link = document.createElement('a');
					link.href = window.URL.createObjectURL(blob);
					link.download = $scope.inputFilter.Phenomenon+'.csv';
					link.click();
		        } else {
		        	$scope.downloadform.emptyData=true;
		        }
		        $scope.downloadform.pleaseWait = false;
			})
			.error(function(data, err) {
				$scope.downloadform.pleaseWait = false;
				if(data.length===0 && err === 404){
					$scope.downloadform.emptyData=true;
				} else {
					$scope.downloadform.errorOccured = true;
					console.log(err);
				}
			});
		});
	};

}]);