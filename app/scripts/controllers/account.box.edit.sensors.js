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

    vm.addSensor = addSensor;
    vm.deleteSensor = deleteSensor;
    vm.saveSensor = saveSensor;
    vm.cancelSensor = cancelSensor;
    vm.editSensor = editSensor;
    vm.getIcon = getIcon;
    vm.setIcon = setIcon;
    vm.undo = undo;

    vm.save = save;

    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData.sensors)) {
        angular.copy(boxData.sensors, vm.sensors);
      }
      vm.icons = SensorIcons;
    }

    function save () {
      return AccountService.updateBox(boxData._id, {sensors: vm.sensors})
        .then(function (response) {
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function (error) {
          console.log('ERROR RESPONSE');
          console.log(error);
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    function addSensor () {
      vm.sensors.push({
        icon: undefined,
        sensorType: undefined,
        title: undefined,
        unit: undefined,
        editing: true,
        new: true
      });

      setSensorsEditMode();
    }

    function deleteSensor (sensor) {
      if(sensor.new){
        var index = vm.sensors.indexOf(sensor);
        if(index !== -1) {
          vm.sensors.splice(index, 1);
        }
      } else {
        sensor.deleted = true;
        sensor.incomplete = false;
      }
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
        sensor.editing = false;
        sensor.incomplete = false;
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
        sensor.incomplete = false;
        sensor.editing = false;
        for (var key in sensor.restore) {
          var value = sensor.restore[key];
          sensor[key] = value;
        }
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
        if (vm.sensors[i].editing) {
          vm.sensorsEditMode = true;
          return;
        }
      }
      vm.sensorsEditMode = false;
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
      sensor.deleted = false;
    }
  }
})();
