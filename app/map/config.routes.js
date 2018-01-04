(function() {
  'use strict';

  angular.module('app.map')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  /* @ngInject */
  function appRun (routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates () {
    return [
      {
        state: 'app.layout.map',
        config: {
          url: '^',
          views: {
            'main@app': {
              controller: 'MapController',
              controllerAs: 'vm',
              templateUrl: 'map/map.html'
            }
          }
        }
      }
    ];
  }
})();
