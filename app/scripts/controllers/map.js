'use strict';

angular.module('openSenseMapApp')
  .controller('MapCtrl', ['$scope', '$state', 'OpenSenseBoxes', function($scope, $state, OpenSenseBoxes){

  	/*
		Set map defaults
  	*/
	$scope.defaults = {
		tileLayer: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', // Mapquest Open
		tileLayerOptions: {
			subdomains: '1234',
			//attribution in info modal
			detectRetina: true,
			reuseTiles: true
		},
		scrollWheelZoom: true
	};

	$scope.center = {
		lat: 51.04139389812637,
		lng: 10.21728515625,
		zoom: 6
	};

	$scope.controls = {};

	/*
		Load markers
	*/
	$scope.markers = [];
	$scope.mapMarkers = [];
	OpenSenseBoxes.query(function(response){
		console.log(response);
		$scope.mapMarkers = response.map(function(obj){
			return {
				lng: obj.loc[0].geometry.coordinates[0],
				lat: obj.loc[0].geometry.coordinates[1],
				station: {
					id: obj._id,
					name: obj.name,
					sensors: obj.sensors
				}
			};
		});
	});

	/*
		When you click on a map marker, the sidebar will open with more possibilities/details for this station
	*/
	$scope.$on('leafletDirectiveMarker.click', function(e, args) {
		// Args will contain the marker name and other relevant information
		//$scope.getMeasurements();
		$scope.center.lat = args.leafletEvent.target._latlng.lat;
		$scope.center.lng = args.leafletEvent.target._latlng.lng;
		$scope.center.zoom = 15;
		$state.go('explore.boxdetails', { id: args.leafletEvent.target.options.station.id });
		console.log(args);
	});

}]);