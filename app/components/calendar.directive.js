(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemCalendar', OsemCalendar);

  OsemCalendar.$inject = ['moment', '$timeout'];

  /* @ngInject */
  function OsemCalendar (moment, $timeout) {
    var directive = {
      templateUrl: 'components/calendar.directive.html',
      bindToController: true,
      controller: CalendarController,
      controllerAs: 'calendar',
      link: link,
      restrict: 'EA',
      transclude: true,
      scope: {
        osemStartDate: '=',
        osemEndDate: '=',
        osemCurrentText: '@',
        osemClearText: '@',
        osemCloseText: '@',
        osemPlaceholderTextStartDate: '@',
        osemPlaceholderTextEndDate: '@',
        onClear: '&osemOnClear',
        onRangeSet: '&osemOnRangeSet'
      }
    };
    return directive;

    function link(scope, element, attrs) {
      //TODO: destroy
    }
  }

  /* @ngInject */
  function CalendarController (moment, $timeout) {
    var vm = this;

    vm.startDateOpen = false;
    vm.endDateOpen = false;
    vm.stayFocused = false;
    vm.loading = false;

    vm.textStartDate = '';
    vm.textEndDate = '';

    vm.dateOptionsStartDate = {
      maxDate: moment().toDate()
    };
    vm.startTimePicker = {
      isOpen: false,
      isInitalized: false
    };
    vm.dateOptionsEndDate = {
      maxDate: moment().toDate()
    };
    vm.endTimePicker = {
      isOpen: false,
      isInitalized: false
    }

    vm.open = open;
    vm.close = close;
    vm.clear = clear;
    vm.dateSelected = dateSelected;
    vm.setRange = setRange;
    vm.hoverItem = hoverItem;
    vm.showReset = showReset;
    vm.timeChanged = timeChanged;

    activate();

    ////

    function activate () {
      if (angular.isUndefined(vm.osemStartDate) || angular.equals({}, vm.osemStartDate)) {
        vm.textStartDate = vm.osemPlaceholderTextStartDate;
      }
      if (angular.isUndefined(vm.osemEndDate) || angular.equals({}, vm.osemEndDate)) {
        vm.textEndDate = vm.osemPlaceholderTextEndDate;
      }
    }

    function open (id) {
      vm.stayFocused = true;
      switch (id) {
        case 'startDate':
          vm.endDateOpen = false;
          vm.startDateOpen = true;
          break;
        case 'endDate':
          vm.startDateOpen = false;
          vm.endDateOpen = true;
          break;
      }
    }

    function close (id, focused) {
      if (!vm.stayFocused && focused) {
        switch (id) {
          case 'startDate':
            vm.startDateOpen = false;
            $timeout(function () {
              vm.startTimePicker.isOpen = true;
            });
            break;
          case 'endDate':
            vm.endDateOpen = false;
            $timeout(function () {
              vm.endTimePicker.isOpen = true;
            });
            break;
        }
      }
    }

    function dateSelected (id) {
      vm.stayFocused = false;
      switch (id) {
        case 'startDate':
          if (angular.isUndefined(vm.osemStartDate) || vm.osemStartDate === null) {
            vm.osemStartDate = new Date();
            vm.textStartDate = vm.osemPlaceholderTextStartDate;
          } else {
            vm.osemStartDate = moment(vm.osemStartDate);
            vm.textStartDate = moment(vm.osemStartDate).format('L LT');
            vm.dateOptionsEndDate.minDate = vm.osemStartDate.toDate();
            if (!vm.startTimePicker.isInitalized) {
              vm.startTimePicker.time = moment().toDate();
              vm.startTimePicker.isInitalized = true;
              timeChanged('startTime');
            }
          }
          close('startDate', true);
          break;
        case 'endDate':
          if (angular.isUndefined(vm.osemEndDate) || vm.osemEndDate === null) {
            vm.osemEndDate = new Date();
            vm.textEndDate = vm.osemPlaceholderTextEndDate;
          } else {
            vm.osemEndDate = moment(vm.osemEndDate);
            vm.textEndDate = moment(vm.osemEndDate).format('L LT');
            vm.dateOptionsStartDate.maxDate = vm.osemEndDate.toDate();
            if (!vm.endTimePicker.isInitalized) {
              vm.endTimePicker.time = moment().toDate();
              vm.endTimePicker.isInitalized = true;
              timeChanged('endTime');
            }
          }
          close('endDate', true);
          break;
      }

      //TODO check if time range has changed
      if (moment.isMoment(vm.osemStartDate) &&
        moment.isMoment(vm.osemEndDate) &&
        vm.startTimePicker.isInitalized &&
        vm.endTimePicker.isInitalized) {
        executeCallback(vm.onRangeSet);
      }
    }

    function executeCallback (func) {
      if (angular.isDefined(func) && angular.isFunction(func)) {
        vm.loading = true;
        $timeout(function () {
          func()
            .then(function (response) {
              vm.loading = false;
            });
        }, 500);
      }
    }

    function clear () {
      vm.osemStartDate = new Date();
      vm.textStartDate = vm.osemPlaceholderTextStartDate;
      vm.osemEndDate = new Date();
      vm.textEndDate = vm.osemPlaceholderTextEndDate;

      executeCallback(vm.onClear);
    }

    function setRange (number, type) {
      vm.osemEndDate = moment();
      vm.textEndDate = moment(vm.osemEndDate).format('L LT');
      vm.osemStartDate = moment(vm.osemEndDate).subtract(number, type);
      vm.textStartDate = moment(vm.osemStartDate).format('L LT');

      executeCallback(vm.onRangeSet);
    }

    function hoverItem (hover) {
      vm.hover = hover;
    }

    function showReset () {
      if (!vm.loading && vm.osemStartDate && vm.osemEndDate) {
        return true;
      }
      if (vm.loading && !angular.equals({}, vm.osemStartDate) && !angular.equals({}, vm.osemEndDate)) {
        return true;
      }
      return false;
    }

    function timeChanged(element) {
      switch (element) {
        case 'startTime':
          vm.osemStartDate.hour(vm.startTimePicker.time.getHours());
          vm.osemStartDate.minute(vm.startTimePicker.time.getMinutes());
          vm.textStartDate = moment(vm.osemStartDate).format('L LT');
          break;
        case 'endTime':
          vm.osemEndDate.hour(vm.endTimePicker.time.getHours());
          vm.osemEndDate.minute(vm.endTimePicker.time.getMinutes());
          vm.textEndDate = moment(vm.osemEndDate).format('L LT');
          break;
        default:
          break;
      }
      //TODO check if time range has changed
      if (moment.isMoment(vm.osemStartDate) &&
        moment.isMoment(vm.osemEndDate) &&
        vm.startTimePicker.isInitalized &&
        vm.endTimePicker.isInitalized) {
        executeCallback(vm.onRangeSet);
      }
    }
  }
})();
