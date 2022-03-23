(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxSensorsController', EditBoxSensorsController);

  EditBoxSensorsController.$inject = ['boxData', 'notifications', 'SensorIcons', 'AccountService'];

  function EditBoxSensorsController (boxData, notifications, SensorIcons, AccountService) {
    var vm = this;
    vm.sensors = [];
    vm.icons = [];
    vm.deleteOptions = {
      fromDate: undefined,
      toDate: undefined,
      method: 'timeframe',
      params: {}
    };

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
    vm.setDeleteMethod = setDeleteMethod;
    vm.save = save;

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

      return AccountService.updateBox(boxData._id, { sensors: sensors })
        .then(function (response) {
          angular.copy(response.data, boxData);
          angular.copy(boxData.sensors, vm.sensors);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function () {
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

    function deleteSensor (sensor) {
      if (sensor.new) {
        var index = vm.sensors.indexOf(sensor);
        if (index !== -1) {
          vm.sensors.splice(index, 1);
        }
      } else {
        sensor.deleted = true;
      }

      setSensorsEditMode();
    }

    function saveSensor (sensor) {
      if (angular.isUndefined(sensor.icon) ||
        angular.isUndefined(sensor.title) ||
        angular.isUndefined(sensor.sensorType) ||
        angular.isUndefined(sensor.unit))
      {
        sensor.incomplete = true;

        return false;
      }
      delete sensor.editing;
      delete sensor.incomplete;
      delete sensor.restore;
      sensor.edited = true;


      setSensorsEditMode();
    }

    function cancelSensor (sensor) {
      if (sensor.new) {
        var index = vm.sensors.indexOf(sensor);
        if (index !== -1) {
          vm.sensors.splice(index, 1);
        }
      } else {
        for (var key in sensor.restore) {
          if (key) {
            var value = sensor.restore[key];
            sensor[key] = value;
          }
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
      setSensorsEditMode();
    }

    function setSensorsEditMode () {
      for (var i = vm.sensors.length - 1; i >= 0; i--) {
        if (vm.sensors[i].editing || vm.sensors[i].measurementsediting) {
          return;
        }
      }
    }

    function getIcon (sensor) {
      if (sensor.icon !== undefined) {
        return sensor.icon;
      }
      if ((sensor.sensorType === 'HDC1008' || sensor.sensorType === 'DHT11') && sensor.title === 'Temperatur') {
        return 'osem-thermometer';
      } else if (sensor.sensorType === 'HDC1008' || sensor.title === 'rel. Luftfeuchte' || sensor.title === 'Luftfeuchtigkeit') {
        return 'osem-humidity';
      } else if (sensor.sensorType === 'LM386') {
        return 'osem-volume-up';
      } else if (sensor.sensorType === 'BMP280' && sensor.title === 'Luftdruck') {
        return 'osem-barometer';
      } else if (sensor.sensorType === 'TSL45315' || sensor.sensorType === 'VEML6070') {
        return 'osem-brightness';
      }

      return 'osem-dashboard';


    }

    function setIcon (sensor, newIcon) {
      sensor.icon = newIcon.name;
    }

    function undo (sensor) {
      delete sensor.deleted;
    }

    function setDeleteMethod (method) {
      delete vm.deleteOptions.params;
      switch (method) {
      case 'timeframe':
        vm.deleteOptions.method = 'timeframe';
        if (angular.isDefined(vm.deleteOptions.fromDate) && angular.isDefined(vm.deleteOptions.toDate)) {
          vm.deleteOptions.params = {
            'from-date': vm.deleteOptions.fromDate.toISOString(),
            'to-date': vm.deleteOptions.toDate.toISOString()
          };
        }
        break;
      case 'all':
        vm.deleteOptions.method = 'all';
        vm.deleteOptions.params = {
          deleteAllMeasurements: true
        };
        break;
      }
    }

    function editMeasurements (sensor) {
      sensor.restore = angular.copy(sensor);
      sensor.measurementsediting = true;
      setSensorsEditMode();
    }

    function deleteMeasurements (sensor) {
      setDeleteMethod(vm.deleteOptions.method);

      return AccountService.deleteMeasurement(boxData._id, sensor._id, vm.deleteOptions.params)
        .then(function () {
          notifications.addAlert('info', 'NOTIFICATION_SUCCESSFULLY_DELETED', sensor._id);
        })
        .catch(function () {
          notifications.addAlert('danger', 'NOTIFICATION_NO_MATCHING_MEASUREMENTS');
        });
    }
  }
})();
