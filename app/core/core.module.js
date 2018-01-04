(function() {
  'use strict';

  angular.module('app.core', [
    /**
     * Angular modules
     */
    'ngResource',
    'ngSanitize',

     /**
      * Our reuseable cross app code modules
      */
    'blocks.router', 'blocks.models', 'app.services',

    /**
     * 3rd Party modules
     */
    'pascalprecht.translate'
  ]);
})();
