(function() {
  'use strict';

  angular.module('app.layout')
  .run(appRun);

    appRun.$inject = ['routerHelper'];

    /* @ngInject */
    function appRun (routerHelper) {
      routerHelper.configureStates(getStates());
    }

    function getStates () {
      return [
        {
          state: 'app.shell',
          config: {
            url: '^/',
            views: {
              'header': {
                templateUrl: 'layout/topnav.html',
                controller: 'TopNavController',
                controllerAs: 'vm'
              },
              'main': {
                templateUrl: 'map/map.html',
                controller: 'MapController',
                controllerAs: 'vm'
              }
            }
          }
        }
      ];
    }
})();
