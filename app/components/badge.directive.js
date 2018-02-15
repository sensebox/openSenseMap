(function () {
    'use strict';

    angular
        .module('openSenseMapApp')
        .directive('osemBadgeRefresh', osemBadgeRefresh);

    osemBadgeRefresh.$inject = [];

    function osemBadgeRefresh () {
        var directive = {
            templateUrl: 'components/badge.directive.html',
            link: link,
            restrict: 'EA',
            transclude: true,
            controller: BadgeRefreshController,
            controllerAs: 'badge',
            bindToController: true, // because the scope is isolated
            scope: {
                refreshTime: '='
            }
        };
        return directive;

        ////

        function link (scope, element, attrs) {}
    }

    BadgeRefreshController.$inject = ['$scope', '$timeout'];

    function BadgeRefreshController ($scope, $timeout) {
        var vm = this;

        vm.secs = vm.refreshTime;
        vm.timerStarted = false;
        vm.$onInit = onInit;
        vm.$onDestroy = onDestroy;

        vm.refresh = refresh;

        ////

        function onInit () {
            activate();
        }

        function onDestroy () {
            $timeout.cancel(vm.prom);
            resetTimer();
        }

        function activate () {
            timer();
        }

        function timer () {
            if (vm.secs < 0) {
                resetTimer();
                var eventName = 'osemBadgeRefreshFinished';
                $scope.$emit(eventName, {});
                $scope.$apply();
            } else if (vm.timerStarted) {
                tick();
            }
        }

        function tick () {
            vm.prom = $timeout(function () {
                vm.secs -= 1;
                timer();
            }, 1000);
        }

        function resetTimer () {
            vm.secs = vm.refreshTime;
            vm.timerStarted = false;
        }

        function refresh () {
          $timeout.cancel(vm.prom);
          resetTimer();
          var eventName = 'osemBadgeRefreshFinished';
          $scope.$emit(eventName, {});
        }

        ////

        $scope.$on('osemBadgeRefreshStartTimer', function () {
            vm.timerStarted = true;
            tick();
        });
    }
})();
