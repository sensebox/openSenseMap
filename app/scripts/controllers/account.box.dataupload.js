(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('DataUploadController', DataUploadController);

  DataUploadController.$inject = ['$scope', '$state', 'OpenSenseMapAPI'];//, 'boxData', 'notifications'];

  function DataUploadController ($scope, $state, OpenSenseMapAPI) {
    var vm = this;
    vm.error = '';
    vm.success = false;
    vm.dataFormat = 'text/csv';
    vm.measurementData = '';
    vm.dataTypes = {
      'text/csv': {
        name: 'CSV',
        example: 'sensorID,value,timestamp,longitude,latitude,height',
      },
      'application/json': {
        name: 'JSON',
        example: '[{"sensor":"597d010ef8c8dd504e54621d", "value":"32.1"}, {"sensor":"597d010ef8c8dd504e54621d", "value":"12.3", "createdAt":"2017-01-01T00:00:00Z", "location": [180,90,10]}]',
      },
    };

    vm.submitData = submitData;
    vm.onFileSelect = onFileSelect;

    var mimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/json'];

    activate();

    ////

    function activate () {
      console.log(navigator);
      vm.fileReader = new FileReader();
      vm.fileReader.onload = function (e) {
        $scope.$apply(function () {
          vm.measurementData = e.target.result;
        });
      };
    }

    function onFileSelect (event, $flow, file) {
      event.preventDefault();
      vm.error = '';
      console.log(file);
      if (mimeTypes.indexOf(file.file.type) === -1) {
        vm.error = { code: 'FORMAT' };

        return;
      }

      switch (file.file.type) {
      case 'text/csv':
      case 'application/vnd.ms-excel':
        vm.dataFormat = 'text/csv';
        break;
      case 'application/json':
        vm.dataFormat = 'application/json';
        break;
      default:
        vm.dataFormat = file.file.type;
        break;
      }

      vm.fileReader.readAsText(file.file);
    }

    function submitData () {
      vm.success = false;
      vm.error = '';
      OpenSenseMapAPI
        .postMeasurements($state.params.id, vm.measurementData, vm.dataFormat, $state.params.box.access_token)
        .then(function () {
          vm.success = true;
        })
        .catch(function (err) {
          vm.error = err;
        });
    }
  }
})();
