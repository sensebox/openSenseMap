'use strict';

angular.module('openSenseMapApp')
  .controller('EditboxCtrl', ['$scope', 'Validation',
  	function($scope, Validation){

  	$scope.selectedMarker = $scope.$parent.selectedMarker;

  	$scope.apikey = {};
	$scope.enableEditableMode = function () {
		var boxId = $scope.selectedMarker._id || $scope.selectedMarker.id;

		Validation.checkApiKey(boxId,$scope.apikey.key).then(function(status){
			$scope.apikeyIssue = false;
			if (status === 200) {
				$scope.editableMode = true;
				//$scope.tmpSensor = angular.copy($scope.selectedMarker);
			} else {
				$scope.apikeyIssue = true;
				$scope.editableMode = false;
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