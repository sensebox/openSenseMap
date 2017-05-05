(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxTtnController', EditBoxTtnController);

  EditBoxTtnController.$inject = ['$scope', 'boxData', 'AccountService'];

  function EditBoxTtnController ($scope, boxData, AccountService) {
    var vm = this;
    vm.validTTNconfig = true;
    vm.settings = {
      profile: 'sensebox/home',
      app_id: '',
      dev_id: '',
      decodeOptions: '[]'
    };

    vm.save = save;

    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData.integrations) && angular.isDefined(boxData.integrations.ttn)) {
        angular.copy(boxData.integrations.ttn, vm.settings);
      }
    }

    function save () {
      return AccountService.updateBox(boxData._id, {ttn: vm.settings})
        .then(function (response) {
          console.log('SUCCESS RESPONSE');
          console.log(response);
          //TODO set boxData
        })
        .catch(function (error) {
          console.log('ERROR RESPONSE');
          console.log(error);
          //TODO schow error messages
        });
    }

    ////

    // check if valid json for ttn decodeOptions
    $scope.$watch('ttn.settings.decodeOptions', function(newValue) {
      if (!newValue.length) {
        return vm.validTTNconfig = true;
      }
      try {
        if (JSON.parse(vm.settings.decodeOptions).constructor !== Array) {
          throw 'must be an array';
        }
        vm.validTTNconfig = true;
      } catch (e) {
        vm.validTTNconfig = false;
      }
    });
  }
})();
