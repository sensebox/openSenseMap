(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarController', SidebarController);

  SidebarController.$inject = ['$scope', '$timeout', '$window', 'Sidebar'];

  function SidebarController ($scope, $timeout, $window, Sidebar) {
    var vm = this;
    vm.minimized = false;
    vm.Sidebar = Sidebar;
    vm.top = 100;
    vm.height = 50;

    vm.minimize = minimize;

    activate();

    ////

    function activate () {
    }

    function minimize () {
      vm.minimized = !vm.minimized;
      Sidebar.minimized = vm.minimized;
      invalidateSize();
    }

    function invalidateSize () {
      var elem = $window.document.querySelector('#sidebar-title');
      var elemHeight = angular.element(elem)[0].clientHeight;

      if (elemHeight > 50) {
        vm.height = elemHeight + 5;
      } else {
        vm.height = 50;
      }
    }

    ////

    $scope.$on('sidebar:titleChanged', function () {
      $timeout(function () {
        invalidateSize();
      });
    });
  }
})();
