(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxSensorsController', EditBoxSensorsController);

  EditBoxSensorsController.$inject = ['boxData', 'notifications', 'SensorIcons', 'AccountService', 'OpenSenseMapAPI'];

  function EditBoxSensorsController (boxData, notifications, SensorIcons, AccountService, OpenSenseMapAPI) {
    var vm = this;
    vm.sensors = [];
    vm.icons = [];
    vm.timestamps = [{ name: '2018-03-19T18:53:18.005Z'}];
    vm.deleteStamps = [];
    //vm.sensor.chart.data = [];

    vm.addSensor = addSensor;
    vm.deleteSensor = deleteSensor;
    vm.saveSensor = saveSensor;
    vm.saveDisabled = saveDisabled;
    vm.cancelSensor = cancelSensor;
    vm.editSensor = editSensor;
    vm.getIcon = getIcon;
    vm.setIcon = setIcon;
    vm.undo = undo;
    vm.editMeasurements = editMeasurements;
    vm.deleteMeasurements = deleteMeasurements;
    vm.getSensorData = getSensorData;
    vm.addTimestamp = addTimestamp;
    vm.openCalendar = openCalendar;

    vm.save = save;


    vm.settings = {
      deletePickerStart: {
        date: moment().subtract(5, 'm').toDate(),
        open: false,
        buttonBar: {
          show: false
        },
        timepickerOptions: {
          readonlyInput: false,
          showMeridian: false,
          max: null,
          min: null
        },
        datepickerOptions: {
          minDate: null
        }
      },
      deletePickerEnd: {
        date: moment().toDate(),
        open: false,
        buttonBar: {
          show: false
        },
        timepickerOptions: {
          readonlyInput: false,
          showMeridian: false,
          max: null,
          min: null
        },
        datepickerOptions: {
          maxDate: null
        }
      }
    };


    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData.sensorsArray)) {
        angular.copy(boxData.sensorsArray, vm.sensors);
      }
      vm.icons = SensorIcons;
    }

    function save () {
      var sensors = [];
      // Just post new, edited and deleted sensors and not all by default
      for (var index = 0; index < vm.sensors.length; index++) {
        var element = vm.sensors[index];
        if (angular.isDefined(element.new) ||
          angular.isDefined(element.edited) ||
          angular.isDefined(element.deleted)) {
            sensors.push(element);
          }
      }

      return AccountService.updateBox(boxData._id, {sensors: sensors})
        .then(function (response) {
          angular.copy(response.data, boxData);
          angular.copy(boxData.sensors, vm.sensors);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function (error) {
          console.log('ERROR RESPONSE');
          console.log(error);
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    function saveDisabled () {
      if (angular.equals(vm.sensors, []) ||
        angular.equals(boxData.sensors, vm.sensors)
      ) {
        return true;
      }

      return vm.sensorsEditMode;
    }

    function addSensor () {
      vm.sensors.push({
        icon: 'osem-battery',
        sensorType: undefined,
        title: undefined,
        unit: undefined,
        editing: true,
        new: true,
      });

      setSensorsEditMode();
    }



    /*function getLatestSensorData (boxId, sensorId) {
      return $http.get(getUrl() + '/boxes/' + boxId + '/data/' + sensorId)
        .then(success)
        .then(function (measurements) {
          // attach an id to each measurement
          for (var i = 0; i < measurements.length; i++) {
            measurements[i].id = i;
          }

          return measurements;
        })
        .catch(failed);
    }*/

    function deleteSensor (sensor) {
      if(sensor.new){
        var index = vm.sensors.indexOf(sensor);
        if(index !== -1) {
          vm.sensors.splice(index, 1);
        }
      } else {
        sensor.deleted = true;
      }

      setSensorsEditMode();
    }

    function saveSensor (sensor) {
      if(angular.isUndefined(sensor.icon) ||
        angular.isUndefined(sensor.title) ||
        angular.isUndefined(sensor.sensorType) ||
        angular.isUndefined(sensor.unit))
      {
        sensor.incomplete = true;
        return false;
      } else {
        delete sensor.editing;
        delete sensor.incomplete;
        delete sensor.restore;
        sensor.edited = true;
      }

      setSensorsEditMode();
    }

    function cancelSensor (sensor) {
      if(sensor.new) {
        var index = vm.sensors.indexOf(sensor);
        if(index !== -1) {
          vm.sensors.splice(index, 1);
        }
      } else {
        for (var key in sensor.restore) {
          var value = sensor.restore[key];
          sensor[key] = value;
        }
        // Remove editing keys
        delete sensor.incomplete;
        delete sensor.editing;
        delete sensor.restore;
        delete sensor.measurementsediting;
      }

      setSensorsEditMode();
    }

    function editSensor (sensor) {
      sensor.restore = angular.copy(sensor);
      sensor.editing = true;
      console.log(sensor);
      setSensorsEditMode();
    }

    function setSensorsEditMode () {
      for (var i = vm.sensors.length - 1; i >= 0; i--) {
        if (vm.sensors[i].editing || vm.sensors[i].measurementsediting) {
          vm.sensorsEditMode = true;
          return;
        }
      }
      vm.sensorsEditMode = false;
      // sensorEditMode = ??? was ist das wo wird benutzt
    }

    function getIcon (sensor) {
      if (sensor.icon !== undefined) {
        return sensor.icon;
      } else {
        if ((sensor.sensorType === 'HDC1008' || sensor.sensorType === 'DHT11')  && sensor.title === 'Temperatur') {
          return 'osem-thermometer';
        } else if (sensor.sensorType === 'HDC1008' || sensor.title === 'rel. Luftfeuchte' || sensor.title === 'Luftfeuchtigkeit') {
          return 'osem-humidity';
        } else if (sensor.sensorType === 'LM386') {
          return 'osem-volume-up';
        } else if (sensor.sensorType === 'BMP280' && sensor.title === 'Luftdruck') {
          return 'osem-barometer';
        } else if (sensor.sensorType === 'TSL45315' || sensor.sensorType === 'VEML6070') {
          return 'osem-brightness';
        } else {
          return 'osem-dashboard';
        }
      }
    }

    function setIcon (sensor,newIcon) {
      sensor.icon = newIcon.name;
    };

    function undo (sensor) {
      delete sensor.deleted;
    }

    function editMeasurements (sensor) {
      sensor.restore = angular.copy(sensor);
      sensor.measurementsediting = true;
      console.log(sensor);
      getSensorData(sensor, {});
      //sensor.editing = true;


      /*return getLatestSensorData(boxData._id, sensor._id)
        .then(function (response) {
          angular.copy(response.data, sensor.chart.data);
          angular.copy(sensor.chart.data, vm.sensor.chart.data);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function (error) {
          console.log('ERROR RESPONSE');
          console.log(error);
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });*/

      setSensorsEditMode();
    }

    function deleteMeasurements (sensor){
      console.log(vm.deleteOptions);
      if(vm.deleteOptions === 'deleteAll'){
        console.log('I am Delete All');
        return AccountService.deleteMeasurement(boxData._id, sensor._id, 
        {
          deleteAllMeasurements: true
        });
      }
    
      if(vm.deleteOptions === 'timestamps'){
        console.log('I am timestamps');
        var timestampsArr = vm.deleteStamps;
        return AccountService.deleteMeasurement(boxData._id, sensor._id, 
        {
          timestamps: timestampsArr
        });
      }
      if(vm.deleteOptions === 'fromToDate'){
        console.log('I am fromToDate');
        var fromDate = vm.settings.deletePickerStart.date;
        var toDate = vm.settings.deletePickerEnd.date;
        return AccountService.deleteMeasurement(boxData._id, sensor._id, 
        {
          'from-date': fromDate,
          'to-date': toDate
        });
      }

      setSensorsEditMode();
    }

    function getSensorData (sensor, data) {
      return OpenSenseMapAPI.getSensorData(boxData._id, sensor._id, data)
      .then(function (response) {
        sensor.chart = [];
        sensor.chart.data = [];
        for (var j = 0; j < response.length; j++) {
          sensor.chart.data.push({
            id: response[j].id,
            value: parseFloat(response[j].value),
            date: new Date(response[j].createdAt),
            unit: sensor.unit,
          });
        }
        sensor.chart.done = true;
        return response;
      })
      .then(function (measurements) {
        return measurements;
      })
      .catch(function (error) {
        sensor.chart.error = true;
      });
    }

    

    function addTimestamp () {
      console.log('hello');
      if (vm.timestampName) {
      vm.timestamps.push({ name: vm.timestampName });
      vm.deleteStamps.push(vm.timestampName);
      console.log(vm.deleteStamps);
      vm.timestampName = '';
      }
    }

    function openCalendar (e, picker) {
      e.preventDefault();
      e.stopPropagation();
      switch(picker) {
        case 'deletePickerStart':
          vm.settings.deletePickerStart.open = true;
          break;
        case 'deletePickerEnd':
          vm.settings.deletePickerEnd.open = true;
          vm.settings.deletePickerEnd.datepickerOptions.maxDate = moment().toDate();
          vm.settings.deletePickerEnd.datepickerOptions.minDate = vm.settings.deletePickerStart.date;
          vm.settings.deletePickerEnd.timepickerOptions.max = moment().toDate();
          vm.settings.deletePickerEnd.timepickerOptions.min = vm.settings.deletePickerStart.timepickerOptions.max;
          /*$timeout(function () {
            //TODO check jqLite
            // angular.element('#deletePickerEnd').parent()[0].children[1].style.right = "0px";
            // angular.element('#deletePickerEnd').parent()[0].children[1].style.left = "auto";
          });*/
          break;
      }
    }


  }
})();
