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
        markers: '=',
        center: '=',
        events: '='
      }
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
      }).setView([51.04139389812637, 10.2172851562], 6);
      ctrl._leafletMap.resolve(map);

      map.on('click', onMapClick);

      var mcg = L.markerClusterGroup({
            maxClusterRadius: 2*rmax,
            iconCreateFunction: defineClusterIcon,
            disableClusteringAtZoom: 17,
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false
          }),
          activeMarkerGroup = L.featureGroup.subGroup(mcg),
          inactiveMarkerGroup = L.featureGroup.subGroup(mcg),
          oldMarkerGroup = L.featureGroup.subGroup(mcg);

      var mouseOverGroup = L.layerGroup();

      mcg.addTo(map);

      mcg.on('clustermouseover', function (e) {
        var allChildMarkers = e.layer.getAllChildMarkers();
        for (var childMarker in allChildMarkers) {
          var marker = allChildMarkers[childMarker];
          var circle = new L.CircleMarker(marker._latlng, {
            radius: 5,
            color: marker.options.icon.options.markerColor,
            fillOpacity: .3,
            opacity: 0
          });
          mouseOverGroup.addLayer(circle);
        }
        mouseOverGroup.addTo(map);
      });

      mcg.on('clustermouseout', function (e) {
        mouseOverGroup.clearLayers();
        map.removeLayer(mouseOverGroup);
      });

      mcg.on('clusterclick', function (e) {
        map.removeLayer(mouseOverGroup);
      });

      activeMarkerGroup.on('add', function () {
        osemMapData.setLayer('activeMarkers', activeMarkerGroup);
      });

      inactiveMarkerGroup.on('add', function () {
        osemMapData.setLayer('inactiveMarkers', inactiveMarkerGroup);
      });

      oldMarkerGroup.on('add', function () {
        osemMapData.setLayer('oldMarkers', oldMarkerGroup);
      });

      L.tileLayer('@@OPENSENSEMAP_MAPTILES_URL', {
        subdomains: 'abc',
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        detectRetina: true,
        reuseTiles: true,
        maxZoom: 18
      }).addTo(map);

      L.control.scale().addTo(map);

      activeMarkerGroup.addTo(map); // Adding to map now adds all child layers into the parent group.
      inactiveMarkerGroup.addTo(map);
      oldMarkerGroup.addTo(map);

      if (angular.isDefined(scope.events) && !angular.equals({}, scope.events)) {
        if (scope.events.autolocation) {
          map.locate({setView: true, maxZoom: 16});
          map.on('locationfound', onLocationFound);
          map.on('locationerror', onLocationError);
        }
      }

      // Resolve the map object to the promises
      map.whenReady(function() {
        osemMapData.setMap(attrs.id, map);
        scope.$watch('markers', function (newVal, oldVal) {
          if (angular.isDefined(newVal) && !angular.equals({}, newVal)) {
            activeMarkerGroup.clearLayers();
            inactiveMarkerGroup.clearLayers();
            oldMarkerGroup.clearLayers();
            for (var marker in newVal) {
              var box = newVal[marker];
              var boxMarker = L.AwesomeMarkers.icon({
                icon: 'cube',
                prefix: 'fa',
                markerColor: box.icon.markerColor
              });
              boxMarker.opacity = 0.5;
              var marker = L.marker([box.lat,box.lng], {
                icon: boxMarker,
                options: box,
                draggable: box.draggable,
                opacity: box.icon.opacity,
                zIndexOffset: box.icon.zIndexOffset});
              if (box.layer === 'oldMarker') {
                marker.addTo(oldMarkerGroup);
              } else if (box.layer === 'inactiveMarer') {
                marker.addTo(inactiveMarkerGroup);
              } else {
                marker.addTo(activeMarkerGroup);
              }
              marker.on('click', onMarkerClick);
              marker.on('mouseover', onMouseOver);
              marker.on('mouseout', onMouseOut);

              if (box.draggable) {
                marker.on('dragend', onMarkerDragend);
              }
            }
          }
        });

        $rootScope.$broadcast('osemMapReady', {});
      });

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

      function onMouseOver (e) {
        var eventName = 'osemMarkerMouseOver.' + scope.mapId;
        $rootScope.$broadcast(eventName, e);
        $rootScope.$apply();
      }

      function onMouseOut (e) {
        var eventName = 'osemMarkerMouseOut.' + scope.mapId;
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
                return d.options.options['layer'];
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
              pathClassFunc: function(d){return "category-"+d.data.key}
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