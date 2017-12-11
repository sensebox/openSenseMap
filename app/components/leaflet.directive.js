(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemMap', osemMap);

  osemMap.$inject = ['$q', '$rootScope', 'osemMapData'];

  /* @ngInject */
  function osemMap ($q, $rootScope, osemMapData) {
    var rmax = 30;
    var directive = {
      templateUrl: 'components/leaflet.directive.html',
      link: link,
      restrict: 'EA',
      transclude: true,
      controller: function () {
        this._leafletMap = $q.defer();
        this.getMap = function () {
          return this._leafletMap.promise;
        };
      },
      scope: {
        markers: '=',            // expects an array of classified markers
        mobileTrajectory: '=',   // expects geojson linestring
        mobileMeasurements: '=', // expects array of API measurements
        mobileLegendInfo: '=',   // contains metadata for the contents of `mobileMeasurements`
        highlightedMeasurement: '=',
        center: '=',
        events: '='
      },
    };

    return directive;

    function link(scope, element, attrs, ctrl) {
      //TODO: destroy
      scope.mapId =  attrs.id;

      var map = new L.map(element[0], {
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
        scrollWheelZoom: true
      }).setView([51.04139389812637, 10.2172851562], 3);
      ctrl._leafletMap.resolve(map);

      map.on('click', onMapClick);

      var mcg = L.markerClusterGroup({
        maxClusterRadius: 2*rmax,
        iconCreateFunction: defineClusterIcon,
        disableClusteringAtZoom: 17,
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false
      });

      var mapLayers = {
        'selectedBoxMarker': L.featureGroup().setZIndex(1000),
        'mobileTrajectory': L.featureGroup(),
        'mobileMeasurements': L.featureGroup(),

        'markerCluster': mcg,
        // adding to map adds all child layers into the parent group for subgroups
        'activeMarkers': L.featureGroup.subGroup(mcg),
        'inactiveMarkers': L.featureGroup.subGroup(mcg),
        'oldMarkers': L.featureGroup.subGroup(mcg),
        'mouseOver': L.layerGroup(),
      };

      for (var layerName in mapLayers) {
        mapLayers[layerName].on('add', function () {
          osemMapData.setLayer(layerName, mapLayers[layerName]);
        });
        map.addLayer(mapLayers[layerName]);
      }

      mcg.on('clustermouseover', function (e) {
        var allChildMarkers = e.layer.getAllChildMarkers();
        for (var childMarker in allChildMarkers) {
          var marker = allChildMarkers[childMarker];
          var circle = new L.CircleMarker(marker._latlng, {
            radius: 5,
            color: marker.options.color.hex,
            fillOpacity: 0.4,
            opacity: 0
          });
          mapLayers['mouseOver'].addLayer(circle);
        }
        map.addLayer(mapLayers['mouseOver']);
      });

      mcg.on('clustermouseout', function (e) {
        mapLayers['mouseOver'].clearLayers();
        map.removeLayer(mapLayers['mouseOver']);
      });

      mcg.on('clusterclick', function (e) {
        map.removeLayer(mapLayers['mouseOver']);
      });

      L.tileLayer('@@OPENSENSEMAP_MAPTILES_URL', {
        subdomains: 'abc',
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        detectRetina: true,
        reuseTiles: true,
        maxZoom: 18
      }).addTo(map);

      L.control.scale().addTo(map);

      if (angular.isDefined(scope.events) && !angular.equals({}, scope.events)) {
        if (scope.events.autolocation) {
          map.locate({setView: true, maxZoom: 16});
          map.on('locationfound', onLocationFound);
          map.on('locationerror', onLocationError);
        }
      }

      scope.$on('boxSelected', function (event, box) {
        var allMarkers = mapLayers['markerCluster'].getLayers();
        var marker;
        for (var layer in allMarkers) {
          if (box._id === allMarkers[layer].options.station._id) {
            marker = allMarkers[layer];
            break;
          }
        }
        mapLayers['markerCluster'].removeLayer(marker);
        mapLayers['selectedBoxMarker'].addLayer(marker);
      });

      scope.$on('boxDeselected', function (event, box) {
        var marker = mapLayers['selectedBoxMarker'].getLayers()[0];
        mapLayers['selectedBoxMarker'].removeLayer(marker);
        mapLayers['markerCluster'].addLayer(marker);
      });

      // Resolve the map object to the promises
      map.whenReady(function() {
        osemMapData.setMap(attrs.id, map);
        // set up watches, which generate map objects from the watched raw data
        scope.$watch('center', function (newVal) {
          if (angular.isDefined(newVal)) map.panTo(newVal);
        });
        scope.$watch('markers', onMarkersWatch);
        scope.$watch('mobileTrajectory', onTrajectoryWatch);
        scope.$watch('mobileMeasurements', onMeasurementsWatch);
        scope.$watch('highlightedMeasurement', onHighlightWatch);
        $rootScope.$broadcast('osemMapReady', {});
      });

      function onMarkersWatch (newVal, oldVal) {
        if (angular.isDefined(newVal) && !angular.equals({}, newVal)) {
          mapLayers['activeMarkers'].clearLayers();
          mapLayers['inactiveMarkers'].clearLayers();
          mapLayers['oldMarkers'].clearLayers();
          for (var markerId in newVal) {
            var markerOpts = newVal[markerId];
            var marker = L.marker(markerOpts.latLng, markerOpts);
            marker.addTo(mapLayers[markerOpts.layerName]);
            marker.on('click', onMarkerClick);
            marker.on('mouseover', onMarkerMouseOver);
            marker.on('mouseout', onMarkerMouseOut);

            if (markerOpts.draggable) {
              marker.on('dragend', onMarkerDragend);
            }
          }
        }
      }

      function onTrajectoryWatch (newVal, oldVal) {
        mapLayers['mobileTrajectory'].clearLayers();
        if (
          !angular.isDefined(newVal) ||
          angular.equals({}, newVal) ||
          !newVal.geometry.coordinates.length
        ) return;

        // swap latLngs
        var latlngs = newVal.geometry.coordinates.map(function (latlng) {
          return [latlng[1], latlng[0], latlng[3]];
        });

        var line = L.polyline(latlngs, {
          color: '#333',
          opacity: 0.7,
          weight: 2,
          interactive: false
        });

        mapLayers['mobileTrajectory'].addLayer(line).bringToBack();

        // update marker position in case it has changed
        var marker = mapLayers['selectedBoxMarker'].getLayers()[0];
        marker.setLatLng(latlngs[latlngs.length - 1]);
      }

      function onMeasurementsWatch (newVal, oldVal) {
        mapLayers['mobileMeasurements'].clearLayers();
        if (!angular.isDefined(newVal) || angular.equals([], newVal)) return;

        // find min & max values for color grading
        var values = newVal.map(function(m) { return m.value; });
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);
        var palette = d3.scaleLinear()
          .domain([min, max])
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb('#375F73'), d3.rgb('#B5F584')]);

        angular.extend(scope.mobileLegendInfo, {
          minVal: min,
          maxVal: max,
          // the legend uses a css color gradient, which interpolates RGB only.
          // to emulate a HCL gradient, we pass many hcl colors close to each other
          colors: [1,2,3,4,5,6,7,8,9,10].map(palette.copy().domain([10, 1])),
        });

        for (var val in newVal) {
          // swap latlngs
          var measure = newVal[val];
          var latlng = [measure.location[1], measure.location[0], measure.location[3]];

          var marker = L.circleMarker(latlng, {
            radius: 6,
            weight: 0.3,
            color: '#222',
            fillOpacity: 1,
            fillColor: palette(measure.value),
            hoverlabelContent: [measure.value, scope.mobileLegendInfo.unit].join(' '),
            measurement: measure,
          });

          marker.on('mouseover', onMeasurementMouseOver);
          marker.on('mouseout', onMeasurementMouseOut);

          mapLayers['mobileMeasurements'].addLayer(marker);
        }
      }

      function onHighlightWatch (newVal, oldVal) {
        var layers = mapLayers['mobileMeasurements'].getLayers();
        if (angular.isDefined(newVal) && !angular.equals({}, newVal)) {
          highlightMeasurement(layers.find(function (layer) {
            return layer.options.measurement.id === newVal.id;
          }));
        }
        if (angular.isDefined(oldVal) && !angular.equals({}, oldVal)) {
          unHighlightMeasurement(layers.find(function (layer) {
            return layer.options.measurement.id === oldVal.id;
          }));
        }
      }

      function highlightMeasurement (measureLayer) {
        if (angular.isDefined(measureLayer)) {
          measureLayer.setStyle({ weight: 2, radius: 8 }).bringToFront();
        }
      }

      function unHighlightMeasurement (measureLayer) {
        if (angular.isDefined(measureLayer)) {
          measureLayer.setStyle({ weight: 0.5, radius: 6 });
        }
      }

      function onLocationFound (e) {
        var eventName = 'osemMapOnLocationFound.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onLocationError (e) {
        var eventName = 'osemMapOnLocationError.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMapClick (e) {
        var eventName = 'osemMapClick.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMarkerDragend (e) {
        var eventName = 'osemMarkerDragend.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMarkerMouseOver (e) {
        var eventName = 'osemMarkerMouseOver.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMarkerMouseOut (e) {
        var eventName = 'osemMarkerMouseOut.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMeasurementMouseOver (e) {
        scope.highlightedMeasurement = e.target.options.measurement;
        var eventName = 'osemMeasurementMouseOver.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMeasurementMouseOut (e) {
        scope.highlightedMeasurement = {};
        var eventName = 'osemMeasurementMouseOut.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMarkerClick (e) {
        var eventName = 'osemMarkerClick.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
      }

      function defineClusterIcon (cluster) {
        var children = cluster.getAllChildMarkers(),
            n = children.length,
            strokeWidth = 1,
            r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0),
            iconDim = (r+strokeWidth)*2,
            data = d3.nest()
              .key(function (d) {
                return [
                  d.options.color.hex,
                  d.options.color.opacity,
                ].join('__');
              })
              .entries(children, d3.map),
            html = bakeThePie({
              data: data,
              valueFunc: function(d){return d.values.length;},
              strokeWidth: 1,
              outerRadius: r,
              innerRadius: r-10,
              pieClass: 'cluster-pie',
              pieLabel: n,
              pieLabelClass: 'marker-cluster-pie-label',
              pathStyleFunc: function (d) {
                var col = d.data.key.split('__')[0];
                var opac = d.data.key.split('__')[1];

                return 'fill:'+col+';stroke:'+col+';background:'+col+';border-color:'+col+';opacity:'+opac;
              },
            }),
            myIcon = new L.DivIcon({
              html: html,
              className: 'marker-cluster',
              iconSize: new L.Point(iconDim, iconDim)
            });
        return myIcon;
      }

      function bakeThePie (options) {
        /*data and valueFunc are required*/
        if (!options.data || !options.valueFunc) {
          return '';
        }
        var data = options.data,
            valueFunc = options.valueFunc,
            r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
            rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
            strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
            pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
            pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
            pathStyleFunc = options.pathStyleFunc?options.pathStyleFunc:function(){return '';}, //Style for each path
            pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
            pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc), //Label for the whole pie
            pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',//Class for the pie label

            origo = (r+strokeWidth), //Center coordinate
            w = origo*2, //width and height of the svg element
            h = w,
            donut = d3.pie(),
            arc = d3.arc().innerRadius(rInner).outerRadius(r);

        //Create an svg element
        var svg = document.createElementNS(d3.namespaces.svg, 'svg');
        //Create the pie chart
        var vis = d3.select(svg)
            .data([data])
            .attr('class', pieClass)
            .attr('width', w)
            .attr('height', h);

        var arcs = vis.selectAll('g.arc')
            .data(donut.value(valueFunc))
            .enter().append('svg:g')
            .attr('class', 'arc')
            .attr('transform', 'translate(' + origo + ',' + origo + ')');

        arcs.append('svg:path')
            .attr('style', pathStyleFunc)
            .attr('class', pathClassFunc)
            .attr('stroke-width', strokeWidth)
            .attr('d', arc);

        vis.append('text')
            .attr('x',origo)
            .attr('y',origo)
            .attr('class', pieLabelClass)
            .attr('text-anchor', 'middle')
            //.attr('dominant-baseline', 'central')
            /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
            .attr('dy','.3em')
            .text(pieLabel);
        //Return the svg-markup rather than the actual element
        return serializeXmlNode(svg);
      }

      /*Helper function*/
      function serializeXmlNode(xmlNode) {
        if (typeof window.XMLSerializer != "undefined") {
            return (new window.XMLSerializer()).serializeToString(xmlNode);
        } else if (typeof xmlNode.xml != "undefined") {
            return xmlNode.xml;
        }
        return "";
      }
    }
  }
})();
