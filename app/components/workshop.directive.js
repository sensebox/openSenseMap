(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemWorkshop', osemWorkshop);

  osemWorkshop.$inject = [];
  function osemWorkshop () {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: 'components/workshop.directive.html',
      link: link,
      restrict: 'EA',
      bindToController: true,
      controller: WorkshopController,
      controllerAs: 'workshop',
    };

    return directive;

    function link (scope, element, attrs) { }
  }

  WorkshopController.$inject = ['$scope'];

  /* @ngInject */
  function WorkshopController ($scope) {
    var vm = this;


    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;
    vm.close = close;
    vm.visible = true;
    vm.activate = activate;

    function onInit () {
      activate();
    }

    function activate () {
      vm.visible = true;
    }

    function onDestroy () {

    }

    function close () {
      vm.visible = false;
    }
  }
})();
