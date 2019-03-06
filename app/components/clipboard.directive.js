(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('clipboard', Directive);

  Directive.$inject = [];
  function Directive () {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      link: link,
      restrict: 'A',
      scope: {
        text: '='
      }
    };

    return directive;

    function link (scope, element, attrs) {
      element.on('click', function (event) {
        console.log(scope.text);
      });
    }
  }
})();
