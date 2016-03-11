'use strict';
ocpu.seturl("https://public.opencpu.org/ocpu/github/mdragunski/inteRsense/R");

angular.module('openSenseMapApp')
	.controller('InterpolationCtrl', 
		['$scope', '$stateParams', '$http', 'OpenSenseBox', 'OpenSenseBoxesSensors', 'OpenSenseBoxAPI', 'leafletData',
		function($scope, $stateParams, $http, OpenSenseBox, OpenSenseBoxesSensors, OpenSenseBoxAPI, leafletData){



		// $scope.$parent.markersFiltered filter result
		// $scope.$parent.markers

              var imageBounds;
              var imageBoundsLegend;
              var overlayImage = null;
              var overlayImageLegend = null;
              $scope.idp = 0;
              $scope.idpPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    		console.log($scope.$parent.markersFiltered);

            var boxes = [];
            console.log(boxes);
            angular.forEach($scope.$parent.markersFiltered, function(value, key) {

                var boxesJSON = {}; 

                for (var i = 0; i < value.station.sensors.length; i++) {
                    if (value.station.sensors[i].lastMeasurement != null && value.station.hasOwnProperty('exposure') && value.station.exposure == 'outdoor' && value.station.sensors[i].title == 'Temperatur') {
                        boxesJSON.latitude = value.lat;
                        boxesJSON.longitude = value.lng;
                        boxesJSON.value = value.station.sensors[i].lastMeasurement.value;

                        boxes.push(boxesJSON);
                    };

                };

                
            });
            console.log(boxes);


	     
	      $scope.makeIDW = function(){
	      
	        $scope.loading = true;

	        if (overlayImage != null) {
	          leafletData.getMap().then(function(map) {
	                map.removeLayer(overlayImage);
	                map.removeLayer(overlayImageLegend);
	              });
	        };

	        var req2 = ocpu.rpc("imageBounds",{
	                input : boxes
	            }, function(outtxt){
	                imageBounds = [[outtxt[0], outtxt[1]], [outtxt[2], outtxt[3]]];
	                imageBoundsLegend = [[outtxt[0], outtxt[1] + 5], [outtxt[2], outtxt[3] + 5]];
	            });

	        var req = ocpu.call("inteRidwIdp", {

	            input : boxes,
	            x : $scope.idp

	          }, function(session) {

	                $scope.loading = false;

	                leafletData.getMap().then(function(map) {
	                  overlayImage = L.imageOverlay(session.getFileURL("idw.png"), imageBounds);
	                  map.addLayer(overlayImage);
	                  if ($scope.idp != 0) {
	                    overlayImageLegend = L.imageOverlay(session.getFileURL("legend.png"), imageBoundsLegend);
	                    map.addLayer(overlayImageLegend);
	                  };
	                });

	              }).fail(function(){
	                console.log("R returned an error: " + req.responseText); 
	              });

	      };

	      $scope.makeTP = function(){

	        $scope.loading = true;

	        if (overlayImage != null) {
	          leafletData.getMap().then(function(map) {
	                map.removeLayer(overlayImage);
	                map.removeLayer(overlayImageLegend);
	              });
	        };

	        var req2 = ocpu.rpc("imageBounds",{
	                input : boxes
	            }, function(outtxt){
	                imageBounds = [[outtxt[0], outtxt[1]], [outtxt[2], outtxt[3]]];
	                imageBoundsLegend = [[outtxt[0], outtxt[1] + 5], [outtxt[2], outtxt[3] + 5]];
	            });

	        var req = ocpu.call("inteRtp", {

	            input : boxes

	          }, function(session) {

	              $scope.loading = false;

	              leafletData.getMap().then(function(map) {
	                  overlayImage = L.imageOverlay(session.getFileURL("idw.png"), imageBounds);
	                  map.addLayer(overlayImage);
	                  overlayImageLegend = L.imageOverlay(session.getFileURL("legend.png"), imageBoundsLegend);
	                  map.addLayer(overlayImageLegend);
	                });


	              }).fail(function(){
	                console.log("R returned an error: " + req.responseText); 
	              });

	      };


}]);