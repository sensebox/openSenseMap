'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarBoxDetailsCtrl', ['$scope', '$stateParams', 'OpenSenseBox', 'OpenSenseBoxesSensors', function($scope, $stateParams, OpenSenseBox, OpenSenseBoxesSensors){
  	OpenSenseBox.query({ boxId: $stateParams.id }, function(response){
  		$scope.selectedMarker = response;
  	});
  	OpenSenseBoxesSensors.query({ boxId: $stateParams.id }, function(response) {
		$scope.selectedMarkerData = response;
    });
}]);