(function() {
  'use strict';

  angular
    .module('app.map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope'];
  function MapController($scope) {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      console.log('activate map');
    }

    $scope.$on('$destroy', function () {
      console.log('map destroyed');
    });
  }
})();
