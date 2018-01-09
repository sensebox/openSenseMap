(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarController', SidebarController);

  SidebarController.$inject = ['$scope', '$timeout', '$window', 'Sidebar', 'isMobile'];

  function SidebarController ($scope, $timeout, $window, Sidebar, isMobile) {
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
      var leafletBottomContainer = $window.document.querySelector('.leaflet-bottom.leaflet-left');
      if (elem === null) {
        return;
      }
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

        if (isMobile.phone) {
          console.log(leafletBottomContainer)
          leafletBottomContainer.setAttribute("style", "bottom: 50px;");
        }
      } else {
        vm.style = {
          'bottom': vm.maximizedStyle.bottom,
          'top': vm.maximizedStyle.top
        };
        if (isMobile.phone) {
          leafletBottomContainer.setAttribute("style", "bottom: 0px");
        }
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
