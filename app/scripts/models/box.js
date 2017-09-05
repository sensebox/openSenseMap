(function () {
  'use strict';

  angular
    .module('app.models', [])
    .factory('Box', BoxModel);

  BoxModel.$inject = ['Sensor', 'OpenSenseMapAPI'];

  function BoxModel (Sensor, OpenSenseMapAPI) {

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
        switch(this.exposure) {
          case 'indoor':  return 'orange';
          case 'outdoor': return 'olive';
          case 'mobile':  return 'navy';
          default: return ''
        }
      },
      getArchiveLink: function () {
        return "https://archive.opensensemap.org/"+moment().subtract(1, 'days').format('YYYY-MM-DD')+"/"+this.id+"-"+doubleGermanS(this.name).replace(/[^A-Za-z0-9._-]/g,'_');
      },
      getLastMeasurement: function () {
        var that = this;
        OpenSenseMapAPI.getSensors(this._id)
          .then(function (response) {
            for (var index in response.sensors) {
              var sensor = response.sensors[index];

              that.sensors[sensor._id].lastMeasurement.value = sensor.lastMeasurement.value;
              that.sensors[sensor._id].lastMeasurement.createdAt = sensor.lastMeasurement.createdAt;
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
    }

    /**
     * Private function
     * @param {*} value
     */
    var doubleGermanS = function (value) {
      value = value.replace(/ß/g, 'ßß');
      return value;
    }

    var _copy = function (srcObj, destObj) {
      for (var key in srcObj) {
        if (key === 'sensors') {
          destObj['sensors'] = {};
          for (var index in srcObj.sensors) {
            var sensor = new Sensor(srcObj.sensors[index]);
            destObj.sensors[sensor._id] = sensor;
          }
        } else {
          destObj[key] = srcObj[key];
        }
      }
    }

    /**
    * Retrun the constructor function
    */
    return Box;
  }
})();
