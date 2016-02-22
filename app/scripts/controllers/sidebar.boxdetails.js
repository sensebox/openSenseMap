'use strict';

angular.module('openSenseMapApp')
  .controller('SidebarBoxDetailsCtrl', ['$scope', '$stateParams', function($scope, $stateParams){
  	$scope.a = 'a';
  	$scope.selectedMarker = $stateParams.id;
  	console.log($stateParams);
}]);