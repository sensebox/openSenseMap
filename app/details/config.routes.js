(function() {
  'use strict';

  angular.module('sidebar.details')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  /* @ngInject */
  function appRun (routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates () {
    return [
      {
        state: 'app.shell.sidebar.details',
        config: {
          url: '/details',
          views: {
            'sidebarContent': {
              templateUrl: 'details/details.html'
            }
          }
        }
      }
    ];
  }
})();
