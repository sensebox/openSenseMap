(function() {
  'use strict';

  angular.module('app.info')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  /* @ngInject */
  function appRun (routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates () {
    return [
      {
        state: 'app.shell.info',
        config: {
          url: 'info',
          views: {
            'main@app': {
              templateUrl: 'info/info.html',
              controller: 'InfoController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
