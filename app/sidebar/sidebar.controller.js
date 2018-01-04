(function() {
  'use strict';

  angular
    .module('app.sidebar')
    .controller('SidebarController', SidebarController);

  SidebarController.$inject = ['$scope'];
  function SidebarController ($scope) {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      console.log('Activate sidebar');
    }

    $scope.$on('$destroy', function () {
      console.log('sidebar destroyed');
    });
  }
})();
