(function() {
  'use strict';

  angular
    .module('app.layout')
    .controller('TopNavController', TopNavController);

  TopNavController.$inject = ['routerHelper', 'config', 'OpenSenseMapAPI'];

  /* @ngInject */
  function TopNavController(routerHelper, config, OpenSenseMapAPI) {
    var vm = this;

    vm.title = config.appTitle;
    vm.searchString = '';
    vm.showClearSearch = false;
    vm.isNavCollapsed = true;
    vm.counts = {
      boxes: '',
      measurements: '',
      mPerMin: ''
    };

    activate();

    ////////////////

    function activate() {
      // getNavRoutes();
      return getStats()
        .then(function () {
          console.log('Activated Navbar');
        });
    }

    function getStats () {
      return OpenSenseMapAPI.getStats()
        .then(function (data) {
          vm.counts.boxes = data[0];
          vm.counts.measurements = data[1];
          vm.counts.mPerMin = data[2]
          return vm.counts;
        })
        .catch(function (err) {
          console.log(err);
        });
    }

    function getNavRoutes () {
      console.log(routerHelper.getStates());
    }
  }
})();
