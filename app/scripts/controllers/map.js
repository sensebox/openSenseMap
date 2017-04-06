'use strict';

angular.module('openSenseMapApp')
	.controller('MapCtrl', ['$scope', '$window', '$state', 'OpenSenseBoxes', 'leafletData', '$templateRequest', '$compile', 'OpenSenseMapData', 'ngProgressFactory', function($scope, $window, $state, OpenSenseBoxes, leafletData, $templateRequest, $compile, OpenSenseMapData, ngProgressFactory){
		$scope.showAllMarkers = true;
		$scope.inputFilter = $scope.inputFilter || { 'loading': false, 'needsRefresh': false };

	$scope.progressbar = ngProgressFactory.createInstance();
	$scope.progressbar.setColor("#4EAF47");

	/*
		Set map defaults
	*/
	$scope.defaults = {
		minZoom: 2,
		tileLayer: '@@OPENSENSEMAP_MAPTILES_URL',
		maxZoom: 18,
		tileLayerOptions: {
			subdomains: 'abc',
			detectRetina: true,
			reuseTiles: true,
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
			maxZoom: 18
		},
		scrollWheelZoom: true,
		worldCopyJump: true,
		attributionControl: false
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
					url: '@@OPENSENSEMAP_MAPTILES_URL',
					layerOptions: {
						subdomains: ['a', 'b', 'c'],
						detectRetina: true,
						reuseTiles: true,
						attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
						showOnSelector: false,
						maxZoom: 18
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
				hiddenMarker: {
					type: 'group',
					name: 'hiddenMarker',
					visible: false
				}
			}
		},
		markers: {
		},
		filtered: {
		},
		controls: { custom: [] },
		toggleLayer: function(type, event) {
			$scope.layers.overlays[type].visible = !$scope.layers.overlays[type].visible;
      event.stopPropagation();
		},
		watchOptions: { markers: { type: null, individual: { type: null } } }
	});

	/*
		Query markers from API and put them in the $scope.mapMarkers array
		which the map uses to display markers

		Inactive markers (no measurements in 7 days) are displayed with a dark green icon instead of green
		Markers without measurement in 30 days are displayed in gray
	*/
	var MARKER_STATE_OPTS = {
		'hidden': {layer: 'hiddenMarker', marker: icons.iconGray, opacity: 0, zIndexOffset: 300},
		'old': { layer: 'oldMarker', marker: icons.iconGray, opacity: 0.5, zIndexOffset: 0},
		'inactive': { layer: 'inactiveMarker', marker: icons.iconDarkGreen, opacity: 0.65, zIndexOffset: 100 },
		'active': { layer: 'activeMarker', marker: icons.iconGreen, opacity: 1, zIndexOffset: 200 }
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
		var markerOpts = obj.sensors.reduceRight(function (previous, sensor, index) {
			if (sensor.lastMeasurement &&
				sensor.lastMeasurement.createdAt) {

					var createdAt = Date.parse(sensor.lastMeasurement.createdAt);

					// if its 'old' try to determine if other sensors are newer..
					if (previous === 'old' && (now - createdAt < THIRTY_DAYS)) {
						previous = 'inactive';
					}

					// if its 'inactive' try to determine if other sensors are newer..
					if (previous === 'inactive' && (now - createdAt < SEVEN_DAYS)) {
						previous = 'active';
					}
			}

			if (index === 0) { //finally return the correct options
				return MARKER_STATE_OPTS[previous];
			} else { // else just return the state of the previous sensor
				return previous;
			}
		}, 'old');

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

	var hiddenFunc = function (obj) {
		var markerOpts = MARKER_STATE_OPTS['hidden'];
		var marker = {
			layer: markerOpts.layer,
			icon: markerOpts.marker,
			lng: obj.lng,
			lat: obj.lat,
			opacity: markerOpts.opacity,
			riseOnHover: true,
			station: {
				id: obj.station.id,
				name: obj.station.name,
				exposure: obj.station.exposure,
				grouptag: obj.station.grouptag,
				sensors: obj.station.sensors
			},
			zIndexOffset: markerOpts.zIndexOffset
		};
		return marker;
	};

	var insertFunc = function (obj) {
		for (var key in $scope.markers) {
			var box = $scope.markers[key];
			if (box.station.id === obj.station.id) {
				box.layer = obj.layer;
				box.icon = obj.icon;
				box.opacity = obj.opacity;
				return;
			}
		}
	};

	$scope.fetchMarkers = function(date, phenomenon, filteredOnly) {
		$scope.progressbar.start();
		filteredOnly = filteredOnly || false;

		$scope.loading = true;
		if(date!=='' && Array.isArray(date)) {
			date = date.join(',');
		}
		$scope.markersFiltered = {};
		if (!filteredOnly) {
			$scope.markers = {};
		} else {
			$scope.filtered = {};
		}
		OpenSenseBoxes.query({ date: date, phenomenon: phenomenon }, function(response){
			OpenSenseMapData.boxes = [];
			$scope.markersFiltered = {};
			if(!filteredOnly) {
				angular.extend($scope.markers, response.map(filterfunc));
				$scope.markersFiltered = angular.copy($scope.markers);
			} else {
				// Hack for https://github.com/sensebox/openSenseMap/issues/112
				// 1. Copy all markers
				var markersTemp = [];
				angular.extend(markersTemp, $scope.markers);
				// 2. Hide all markers
				var markersTemp = markersTemp.map(hiddenFunc);
				angular.extend($scope.markers, markersTemp);
				// 3. Classify filtered markers and insert them in $scope.markers
				var markersClassified = response.map(filterfunc);
				markersClassified.map(insertFunc);
				$scope.markersFiltered = angular.copy($scope.markers);
			}
			$scope.loading = false;
			for (var key in $scope.markers) {
				var box = $scope.markers[key];
				OpenSenseMapData.boxes.push(box);
			}
			$scope.progressbar.complete();
		});
	};
	$scope.fetchMarkers('', ''); // fetch all markers in the database

	/*
		Show a label next to/on top of markers when mouse cursor is pointing at it
	*/
	$scope.hoverlabel = {
		left: 0,
		top: 0,
		name: ''
	};

	$scope.$on('leafletDirectiveMarker.map_main.mouseover', function (e, args){
		var markerBounds = args.leafletEvent.target._icon.getBoundingClientRect();
		$scope.hoverlabel = {
			left: markerBounds.left+'px',
			top: markerBounds.top-33+'px',
			name: args.leafletEvent.target.options.station.name
		};
	});

	$scope.$on('leafletDirectiveMarker.map_main.mouseout', function (){
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
	leafletData.getMap('map_main').then(function (map) {
		var info = L.control({ position:'bottomleft' });
		info.onAdd = function () {
			var _div = L.DomUtil.create('div', 'leaflet-bar leaflet-control'); // create a div with a class "info"
			this._div = _div;
			$templateRequest('views/explore2.map.legend.html').then(function(html) {
				var template = angular.element(html);
				var infoDiv = angular.element(_div);
				var infoContainer = angular.element(info._container);
				infoDiv.append(template);
				infoContainer.append(template);
				$compile(template)($scope);
			});
			this._div.onclick = $scope.toggleLegend;
			return this._div;
		};
		map.addControl(info);
	});

	$scope.showHide = false;
	$scope.cssClass = '';
	$scope.toggleLegend = function () {
		var zoomControl = document.getElementsByClassName('leaflet-top leaflet-left');
		if ($scope.showHide) {
			$scope.cssClass = '';
			if (document.body.clientHeight <= 400 ) {
				zoomControl[0].classList.remove('hidden');
			}
		} else {
			$scope.cssClass = 'legend-big';
			if (document.body.clientHeight <= 400 ) {
				zoomControl[0].classList.add('hidden');
			}
		}
		$scope.showHide = !$scope.showHide;
	}

  	angular.element($window).bind('orientationchange', function () {
    	var zoomControl = document.getElementsByClassName('leaflet-top leaflet-left');
    	if (document.body.clientHeight <= 460 && $scope.showHide && ($window.orientation === 90 || $window.orientation === -90)) {
      		zoomControl[0].classList.add('hidden');
	    } else if ($window.orientation === 0) {
    	  	zoomControl[0].classList.remove('hidden');
    	}
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
	};
}]);
