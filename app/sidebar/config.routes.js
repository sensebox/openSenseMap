(function() {
  'use strict';

  angular.module('app.sidebar')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  /* @ngInject */
  function appRun (routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates () {
    return [
      {
        state: 'app.shell.sidebar',
        config: {
          url: '^',
          views: {
            'sidebar@app': {
              templateUrl: 'sidebar/sidebar.html',
              controller: 'SidebarController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
