'use strict';

/**
 * @ngdoc directive
 * @name openSenseMapApp.directive:myHolder
 * @description
 * # myHolder
 */
angular.module('openSenseMapApp')
  .directive('myHolder', function () {
    return {
        link: function(scope, element, attrs) {
        attrs.$set('data-src', attrs.myHolder);
        Holder.run({images:element.get(0), nocss:true});
      }
    };
  });
