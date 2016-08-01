'use strict';

angular.module('openSenseMapApp')
	.controller('MapCtrl', ["$scope", "$state", "OpenSenseBoxes", "leafletData", "$templateRequest", "$compile", "$stateParams", function($scope, $state, OpenSenseBoxes, leafletData, $templateRequest, $compile, $stateParams){
		$scope.showAllMarkers = true;
		$scope.inputFilter = $scope.inputFilter || { 'loading': false, 'needsRefresh': false };

	/*
		Set map defaults
	*/
	$scope.defaults = {
		minZoom: 2,
		maxZoom: 22,
		tileLayer: 'OPENSENSEMAP_MAPTILES_URL',
		tileLayerOptions: {
			subdomains: 'abc',
			detectRetina: true,
			reuseTiles: true,
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
			maxZoom: 22
		},
		scrollWheelZoom: true,
		worldCopyJump: true
	};

	// Newer versions of leaflet-directive introduced some very verbose logging which we turn off (mostly)
	$scope.events = {
		map: {
			enable: ['click', 'load', 'zoomstart'],
			logic: 'broadcast'
		}
	};

	// Icons for map markers: For active and inactive boxes
	var icons = {
		iconRed: {
			type: 'awesomeMarker',
			prefix: 'fa',
			icon: 'cube',
			markerColor: 'red',
		},
		iconGreen: {
			type: 'awesomeMarker',
			prefix: 'fa',
			icon: 'cube',
			markerColor: 'green'
		},
		iconDarkGreen: {
			type: 'awesomeMarker',
			prefix: 'fa',
			icon: 'cube',
			markerColor: 'darkgreen'
		},
		iconGray: {
			type: 'awesomeMarker',
			prefix: 'fa',
			icon: 'cube',
			markerColor: 'lightgray'
		}
	};

	angular.extend($scope, {
		center: {
			lat: 51.04139389812637,
          	lng: 10.21728515625,
          	zoom: 6
		},
		layers: {
			baselayers: {
				mapbox: {
					name: 'Mapbox Streets',
					type: 'xyz',
					url: 'OPENSENSEMAP_MAPTILES_URL',
					layerOptions: {
						subdomains: ['a', 'b', 'c'],
						detectRetina: true,
						reuseTiles: true,
						attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
						showOnSelector: false,
						maxZoom: 22
					}
				}
			},
			overlays: {
				activeMarker: {
					type: 'group',
					name: 'activeMarker',
					visible: true
				},
				inactiveMarker: {
					type: 'group',
					name: 'inactiveMarker',
					visible: true
				},
				oldMarker: {
					type: 'group',
					name: 'oldMarker',
					visible: true
				},
				// create inivisible markers for filtering/sorting because of a bug in angular-directive: need to keep the marker ordering in the array
				// https://github.com/tombatossals/angular-leaflet-directive/issues/512
				// https://github.com/tombatossals/angular-leaflet-directive/issues/1041
				temporary: {
					type: 'group',
					name: 'temporary',
					visible: false
				}
			}
		},
		markers: {
		},
    controls: { custom: [] },
		toggleLayer: function(type) {
			$scope.layers.overlays[type].visible = !$scope.layers.overlays[type].visible;
		},
		watchOptions: { markers: { type: null, individual: { type: null } } }
	});

	/*
		Query markers from API and put them in the $scope.mapMarkers array
		which the map uses to display markers

		Inactive markers (no measurements in 7 days) are displayed with a dark green icon instead of green
    Markers without measurement in 30 days are displayed in gray
	*/
	var opts = function(isActive, isInactive){
		if(isActive) {
			return { layer: 'activeMarker', marker: icons.iconGreen, opacity: 1, zIndexOffset: 200 };
		} else if(!isActive && !isInactive) {
			return { layer: 'inactiveMarker', marker: icons.iconDarkGreen, opacity: 0.65, zIndexOffset: 100 };
		} else {
			return { layer: 'oldMarker', marker: icons.iconGray, opacity: 0.5, zIndexOffset: 0};
		}
	};

	/*
		Fetch a set of markers from the server/backend

		If date & phenomenon are set it will download a dataset according to these filters:
			fetchMarkers("2016-03-07T01:50", "Temperatur");
		If filteredOnly is set, then only the $scope.filteredMarkers array will be changed
	*/
	var ONE_DAY = 1000 * 60 * 60 * 24;
	var SEVEN_DAYS = ONE_DAY * 7;
	var THIRTY_DAYS = ONE_DAY * 30;

	var filterfunc = function(obj){
		// decide wheter a box is active, inactive or "dead" by looking at the most recent last measurement's date
		var now = Date.now();
		var isActive = obj.sensors.some(function(cv){
			return cv.lastMeasurement &&
					cv.lastMeasurement.updatedAt &&
					now - Date.parse(cv.lastMeasurement.updatedAt) < SEVEN_DAYS;
		});
		var isInactive = false; // track boxes that have been inactive for a long time
		if(!isActive){
			isInactive = obj.sensors.some(function(cv){
				return !cv.lastMeasurement ||
						!cv.lastMeasurement.updatedAt ||
						now - Date.parse(cv.lastMeasurement.updatedAt) > THIRTY_DAYS;
			});
		}
		var markerOpts = opts(isActive, isInactive);
		var marker = {
			layer: markerOpts.layer,
			icon: markerOpts.marker,
			lng: obj.loc[0].geometry.coordinates[0],
			lat: obj.loc[0].geometry.coordinates[1],
			opacity: markerOpts.opacity,
			riseOnHover: true,
			station: {
				id: obj._id,
				name: obj.name,
				exposure: obj.exposure,
				grouptag: obj.grouptag,
				sensors: obj.sensors
			},
			zIndexOffset: markerOpts.zIndexOffset
		};
		return marker;
	};
	$scope.fetchMarkers = function(date, phenomenon, filteredOnly) {
		filteredOnly = filteredOnly || false;

		$scope.loading = true;
		if(date!=='' && Array.isArray(date)) date = date.join(',');
		$scope.markersFiltered = {};
		if(!filteredOnly) $scope.markers = {};
		OpenSenseBoxes.query({ date: date, phenomenon: phenomenon }, function(response){
			if(!filteredOnly) {
				angular.extend($scope.markers, response.map(filterfunc));
				$scope.markersFiltered = angular.copy($scope.markers);
			} else {
				$scope.markersFiltered = response.map(filterfunc);
			}
			$scope.loading = false;
		});
	};
	$scope.fetchMarkers("", ""); // fetch all markers in the database

	/*
		Show a label next to/on top of markers when mouse cursor is pointing at it
	*/
	$scope.hoverlabel = {
		left: 0,
		top: 0,
		name: ''
	};

	$scope.$on('leafletDirectiveMarker.map_main.mouseover', function(e, args){
		var markerBounds = args.leafletEvent.target._icon.getBoundingClientRect();
		$scope.hoverlabel = {
			left: markerBounds.left,
			top: markerBounds.top,
			name: args.leafletEvent.target.options.station.name
		};
	});

	$scope.$on('leafletDirectiveMarker.map_main.mouseout', function(e, args){
		$scope.hoverlabel = {
			left: 0,
			top: 0,
			name: ''
		};
	});

	/*
		When you click on a map marker, the sidebar will open with more possibilities/details for this station
	*/
	$scope.$on('leafletDirectiveMarker.map_main.click', function(e, args) {
		// Args will contain the marker name and other relevant information
		$scope.centerLatLng(args.leafletEvent.target._latlng);
		$state.go('explore.map.boxdetails', { id: args.leafletEvent.target.options.station.id });
	});

	/*
		Custom legend control
	*/
	leafletData.getMap("map_main").then(function (map) {
		var info = L.control({ position:'bottomleft' });
		info.onAdd = function (map) {
			var _div = L.DomUtil.create('div', 'info sensebox-legend'); // create a div with a class "info"
			this._div = _div;
			$templateRequest('views/explore2.map.legend.html').then(function(html) {
			var template = angular.element(html);
			var infoDiv = angular.element(_div);
			var infoContainer = angular.element(info._container);
			infoDiv.append(template);
			infoContainer.append(template);
			$compile(template)($scope);
		});
		return this._div;
		};
		map.addControl(info);
	});

	// centers a latlng (marker) on the map while reserving space for the sidebar
	$scope.centerLatLng = function(latlng) {
		leafletData.getMap('map_main').then(function(map) {
			var padding = 450; // sidebar width: 450px
			// consider smaller devices (250px min map-width + 450px sidebar-width)
			if (document.body.clientWidth <= 700) padding = 0;

			map.fitBounds([latlng, latlng], {
				paddingTopLeft: [0,0],
				paddingBottomRight: [padding, 0],
				maxZoom: 17,
				animate: false
			});
		});
	}

}]);
