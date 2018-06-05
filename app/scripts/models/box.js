(function () {
  'use strict';

  angular
    .module('app.models', [])
    .factory('Box', BoxModel);

  BoxModel.$inject = ['Sensor', 'OpenSenseMapAPI', 'OpenSenseMapData'];

  function BoxModel (Sensor, OpenSenseMapAPI, OpenSenseMapData) {

    /**
     * Constructor
     * @param {*} box
     */
    function Box (box) {
      _copy(box, this);
    }

    /**
     * Public methods, assigned to prototype
     */
    Box.prototype = {
      getBadgeColor: function () {
        switch (this.exposure) {
        case 'indoor': return 'orange';
        case 'outdoor': return 'olive';
        case 'mobile': return 'sbblue';
        default: return '';
        }
      },
      getArchiveLink: function () {
        return 'https://archive.opensensemap.org/' + moment().subtract(1, 'days')
          .format('YYYY-MM-DD') + '/' + this._id + '-' + doubleGermanS(this.name).replace(/[^A-Za-z0-9._-]/g, '_');
      },
      getLastMeasurement: function () {
        var that = this;
        OpenSenseMapAPI.getSensors(this._id)
          .then(function (response) {
            for (var index in response.sensors) {
              if (index) {
                var sensor = response.sensors[index];

                if (angular.isDefined(sensor.lastMeasurement) &&
                  angular.isDefined(that.sensors[sensor._id].lastMeasurement)
                ) {
                  that.sensors[sensor._id].lastMeasurement.value = sensor.lastMeasurement.value;
                  that.sensors[sensor._id].lastMeasurement.createdAt = sensor.lastMeasurement.createdAt;
                }
              }
              // if (angular.isDefined(vm.sensordata[response.sensors[i]._id])) {
              //           var data = angular.copy(vm.sensordata[response.sensors[i]._id]);
              //           console.log(data);
              //           data.unshift(datapair);
              //           console.log(data.length)
              //           console.log(data);
              //           // remove first entry
              //           //todo check amount of data depending on selected time frame
              //           data.pop();
              //           console.log(data.length)
              //           vm.sensordata[response.sensors[i]._id] = data;
              //         }
            }
          })
          .catch(function (error) {
            return error;
          });
      }
    };

    /**
     * Private function
     * @param {*} value
     */
    var doubleGermanS = function (value) {
      value = value.replace(/[\u00A0-\u10FFFF]/g, '__');

      return value;
    };

    var _copy = function (srcObj, destObj) {
      destObj.markerOptions = OpenSenseMapData.makeMarkerOptions(srcObj);
      for (var key in srcObj) {
        if (key === 'sensors') {
          destObj['sensorsArray'] = srcObj.sensors;
          destObj['sensors'] = {};
          for (var index in srcObj.sensors) {
            if (index) {
              var sensor = new Sensor(srcObj.sensors[index]);
              destObj.sensors[sensor._id] = sensor;
            }
          }
        } else {
          destObj[key] = srcObj[key];
        }
      }
    };

    /**
    * Return the constructor function
    */
    return Box;
  }
})();
