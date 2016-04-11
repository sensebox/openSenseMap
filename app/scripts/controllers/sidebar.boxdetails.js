'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarBoxDetailsCtrl', 
  	['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 'ngDialog', 
  	function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation, ngDialog){

  	$scope.osemapi = OpenSenseBoxAPI;
 	
  	OpenSenseBox.query({ boxId: $stateParams.id }, function(response){
  		$scope.selectedMarker = response;
      console.log(response);
      $scope.$parent.center = {
        lng: response.loc[0].geometry.coordinates[0],
        lat: response.loc[0].geometry.coordinates[1],
        zoom: 14
      };
  	});
  	OpenSenseBoxesSensors.query({ boxId: $stateParams.id }, function(response) {
		  $scope.selectedMarkerData = response;
    });

    $scope.openEditDialog = function () {
      $scope.launchTemp = ngDialog.open({
        template: '/views/editbox.html',
        className: 'ngdialog-theme-default',
        scope: $scope,
        showClose: false,
        closeByDocument: false,
        controller: 'EditboxCtrl'
      });
    };

}]);