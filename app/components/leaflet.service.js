(function () {
  'use strict';

  angular
    .module('leaflet')
    .factory('osemMapData', osemMapData);

  osemMapData.$inject = ['$q'];

  /* @ngInject */
  function osemMapData ($q) {
    var maps = {};
    var layers = {};
    var service = {
      setMap: setMap,
      getMap: getMap,
      getLayer: getLayer,
      getLayers: getLayers,
      setLayer: setLayer
    };

    return service;

    ////

    function setMap (mapId, map) {
      var defer = $q.defer()
      maps[mapId] = map;
      defer.resolve(map[mapId]);
    }

    function getMap (mapId) {
      var deferred = $q.defer();
      var found = false;
      for (var map in maps) {
        if (mapId === map) {
          found = true;
          deferred.resolve(maps[map]);
        }
      }

      if (!found) {
        deferred.reject('Map with mapId ' + mapId + ' not found');
      }

      return deferred.promise;
    }

    function setLayer (layerId, layer) {
      var defer = $q.defer()
      layers[layerId] = layer;
      defer.resolve(layers[layerId]);
    }

    function getLayer (layerId) {
      var deferred = $q.defer();
      var found = false;
      for (var layer in layers) {
        if (layerId === layer) {
          found = true;
          deferred.resolve(layers[layer]);
        }
      }

      if (!found ) {
        deferred.reject('Layer with layerId ' + layerId + ' not found');
      }

      return deferred.promise;
    }

    function getLayers () {
      var deferred = $q.defer();
      deferred.resolve(layers);
      return deferred.promise;
    }
  }
})();
