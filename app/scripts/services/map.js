(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('MapService', MapService);

  function MapService () {
    return {
      defaults: {
        minZoom: 2,
        maxZoom: 18,
        tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileLayerOptions: {
          subdomains: 'abc',
          attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
          detectRetina: true,
          reuseTiles: true,
          maxZoom: 18,
        },
        worldCopyJump: true,
        scrollWheelZoom: true,
        center: {
          lat: 51.04139389812637,
          lng: 10.21728515625,
          zoom: 5
        },
        attributionControl: false
      },
      center: {
        autoDiscover: true
      },
      events: {
        map: {
          enable: ['click', 'locationfound', 'locationerror'],
          logic: 'emit'
        }
      }
    }
  }
})();
