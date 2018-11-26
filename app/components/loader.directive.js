(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemLoader', osemLoader);

  osemLoader.$inject = [];
  function osemLoader () {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: 'components/loader.directive.html',
      link: link,
      restrict: 'EA',
      transclude: true,
      bindToController: true,
      controller: LoaderController,
      controllerAs: 'loader',
      scope: {
        messageText: '=?',
        visible: '=?'
      }
    };

    return directive;

    function link (scope, element, attrs) { }
  }

  LoaderController.$inject = ['$scope'];

  /* @ngInject */
  function LoaderController ($scope) {
    var vm = this;


    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    function onInit () {
      activate();
    }

    function activate () {
      vm.visible = false;
      vm.messageText = 'Fetching boxes and measurements';
    }

    function onDestroy () {

    }

    $scope.$on('osemLoaderUpdateMessage', function (event, attrs) {
      if (attrs && attrs.messageText) {
        vm.messageText = attrs.messageText;
      }
    });

    $scope.$on('osemLoaderVisibility', function (event, attrs) {
      if (attrs && attrs.visible !== undefined) {
        vm.visible = attrs.visible;
      }
    });
  }
})();
