'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarBoxDetailsCtrl', 
  	['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'Validation', 
  	function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, Validation){

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

  	$scope.apikey = {};
  	$scope.enableEditableMode = function () {
  		var boxId = $scope.selectedMarker._id || $scope.selectedMarker.id;

  		Validation.checkApiKey(boxId,$scope.apikey.key).then(function(status){
  			if (status === 200) {
  				$scope.editableMode = true;
  				$scope.tmpSensor = angular.copy($scope.selectedMarker);
  				return true;
  			} else {
  				$scope.editableMode = false;
  				return false;
  			}
  		});
  	};

  	$scope.saveChange = function (event) {
  		console.log("Saving change");
  		var boxid = $scope.selectedMarker.id || $scope.selectedMarker._id;
  		var imgsrc = angular.element(document.getElementById('image')).attr('src');
  		var newBoxData = {
  			tmpSensorName: $scope.tmpSensor.name, 
  			image: imgsrc
  		};
  		$http.put($scope.osemapi.url+'/boxes/'+boxid, newBoxData, { headers: { 'X-ApiKey': $scope.apikey.key } }).
  		success(function(data, status){
  			$scope.editableMode = false;
  			$scope.selectedMarker = data;
  			if (data.image === "") {
  				$scope.image = "placeholder.png";
  			} else {
  				$scope.image = data.image;
  			}
  		}).error(function(data, status){
			// todo: display an error message
		});
  	};

}]);