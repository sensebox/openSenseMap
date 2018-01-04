(function () {
  'use strict';

  angular
    .module('blocks.models')
    .factory('Sensor', SensorModel);

  SensorModel.$inject = [];

  function SensorModel () {

    /**
     * Constructor
     * @param {*} sensor
     */
    function Sensor (sensor) {
      angular.copy(sensor, this);

      //TODO create lastMeasurement property if not existing???

      this.chart = {
        fromDate: undefined,
        toDate: undefined,
        yAxisTitle: '',
        data: [],
        done: false,
        error: false,
      };
    }

    /**
     * Public methods, assigned to prototype
     */
    Sensor.prototype = {
      getIcon: function () {
        if (this.icon !== undefined) {
          return this.icon;
        } else {
          if ((this.sensorType === 'HDC1008' || this.sensorType === 'DHT11')  && this.title === 'Temperatur') {
            return 'osem-thermometer';
          } else if (this.sensorType === 'HDC1008' || this.title === 'rel. Luftfeuchte' || this.title === 'Luftfeuchtigkeit') {
            return 'osem-humidity';
          } else if (this.sensorType === 'LM386') {
            return 'osem-volume-up';
          } else if (this.sensorType === 'BMP280' && this.title === 'Luftdruck') {
            return 'osem-barometer';
          } else if (this.sensorType === 'TSL45315' || this.sensorType === 'VEML6070') {
            return 'osem-brightness';
          } else {
            return 'osem-dashboard';
          }
        }
      }
    }

    /**
    * Retrun the constructor function
    */
    return Sensor;
  }
})();
