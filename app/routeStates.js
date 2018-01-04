(function() {
  'use strict';

  angular.module('app')
  .run(appRun);

    appRun.$inject = ['routerHelper'];

    /* @ngInject */
    function appRun (routerHelper) {
      routerHelper.configureStates(getStates());
    }

    function getStates () {
      return [
        {
          state: 'app',
          config: {
            abstract: true,
            templateUrl: 'layout/shell.html',
            controller: 'ShellController',
            controllerAs: 'vm'
          }
        }
      ];
    }
})();
