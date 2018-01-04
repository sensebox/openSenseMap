(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('OpenSenseMapAPI', OpenSenseMapAPI);

  OpenSenseMapAPI.$inject = ['$http', '$q', 'config'];

  function OpenSenseMapAPI ($http, $q, config) {
    var service = {
      getBoxes: getBoxes,
      getData: getData,
      getBox: getBox,
      getBoxLocations: getBoxLocations,
      getSensors: getSensors,
      getSensorData: getSensorData,
      idwInterpolation: idwInterpolation,
      postMeasurements: postMeasurements,
      deleteMeasurements: deleteMeasurements,
      getStats: getStats
    };

    return service;

    ////

    function success (response) {
      return response.data;
    }

    function failed (error) {
      return $q.reject(error.data);
    }

    function getUrl () {
      return config.appApiUrl;
    }

    function getBoxes (data) {
      return $http.get(getUrl() + '/boxes', data)
        .then(success)
        .catch(failed);
    }

    function getData (data) {
      return $http.get(getUrl() + '/boxes/data', data)
        .then(success)
        .catch(failed);
    }

    function getBox (boxId) {
      return $http.get(getUrl() + '/boxes/' + boxId)
        .then(success)
        .catch(failed);
    }

    function getBoxLocations (boxId, data) {
      return $http
        .get(getUrl() + '/boxes/' + boxId + '/locations', data)
        .then(success)
        .catch(failed);
    }

    function getSensors (boxId) {
      return $http.get(getUrl() + '/boxes/' + boxId + '/sensors')
        .then(success)
        .catch(failed);
    }

    function getSensorData (boxId, sensorId, data) {
      return $http.get(getUrl() + '/boxes/' + boxId + '/data/' + sensorId, data)
        .then(success)
        .then(function (measurements) {
          // attach an id to each measurement
          for (var i = 0; i < measurements.length; i++) {
            measurements[i].id = i;
          }

          return measurements;
        })
        .catch(failed);
    }

    function postMeasurements(boxId, measurements, format) {
      var url = getUrl() + '/boxes/' + boxId + '/data';
      return $http.post(url, measurements, {
          headers: { 'content-type': format }
        })
        .then(success)
        .catch(failed);
    }

    function deleteMeasurements (boxId, sensorId) {
      var url = getUrl() + '/boxes/' + boxId + '/' + sensorId + '/measurements';
      return $http.delete(url, {auth: true})
        .then(success)
        .catch(failed);
    }

    function idwInterpolation (data) {
      return $http.get(getUrl() + '/statistics/idw', data)
        .then(success)
        .catch(failed);
    }

    function getStats () {
      return $http.get(getUrl() + '/stats')
        .then(success)
        .catch(failed);
    }
  }
})();
