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

    vm.minimize = minimize;

    activate();

    ////

    function activate () {
      vm.maximizedStyle = {
        'bottom': '0px',
        'top': '100px'
      }

      invalidateSize();
    }

    function minimize () {
      vm.minimized = !vm.minimized;
      Sidebar.minimized = vm.minimized;
      invalidateSize();
    }

    function invalidateSize () {
      var elem = $window.document.querySelector('#sidebar-title');
      var elemHeight = angular.element(elem)[0].clientHeight;

      var height = 50;
      if (vm.minimized) {
        if (elemHeight > 50) {
          height = elemHeight + 5;
        }

        vm.style = {
          'height': height + 'px',
          'bottom': '0px'
        };
      } else {
        vm.style = {
          'bottom': vm.maximizedStyle.bottom,
          'top': vm.maximizedStyle.top
        };
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
