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

    function link(scope, element, attrs, ctrl) {
      if (attrs.osemOnRangeSet === undefined) {
        ctrl.onRangeSet = undefined;
      }
      if (attrs.osemOnClear === undefined) {
        ctrl.onClear = undefined;
      }
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
      maxDate: moment().startOf('day').toDate()
    };
    vm.dateOptionsEndDate = {
      maxDate: moment().startOf('day').toDate()
    };

    vm.selectedDateOptions =  {};
    vm.selectedDateModel;

    vm.open = open;
    vm.close = close;
    vm.clear = clear;
    vm.dateSelected = dateSelected;
    vm.setRange = setRange;
    vm.hoverItem = hoverItem;
    vm.showReset = showReset;

    var selectedDatePicker = '';

    activate();

    ////

    function activate () {
      if (angular.isUndefined(vm.osemStartDate) || angular.equals({}, vm.osemStartDate)) {
        vm.textStartDate = vm.osemPlaceholderTextStartDate;
      } else {
        vm.textStartDate = moment(vm.osemStartDate).format('L');
      }
      if (angular.isUndefined(vm.osemEndDate) || angular.equals({}, vm.osemEndDate)) {
        vm.textEndDate = vm.osemPlaceholderTextEndDate;
      } else {
        vm.textEndDate = moment(vm.osemEndDate).format('L');
      }
    }

    function open (id) {
      switch (id) {
        case 'startDate':
          if (vm.startDateOpen) {
            close('startDate', true);
            return;
          }
          vm.selectedDateOptions = vm.dateOptionsStartDate;
          vm.selectedDateModel = vm.osemStartDate;
          vm.endDateOpen = false;
          vm.startDateOpen = true;
          selectedDatePicker = 'startDate';
          break;
        case 'endDate':
          if (vm.endDateOpen) {
            close('endDate', true);
            return;
          }
          vm.selectedDateOptions = vm.dateOptionsEndDate;
          vm.selectedDateModel = vm.osemEndDate;
          vm.startDateOpen = false;
          vm.endDateOpen = true;
          selectedDatePicker = 'endDate';
          break;
      }
    }

    function close (id) {
      switch (id) {
        case 'startDate':
          vm.startDateOpen = false;
          break;
        case 'endDate':
          vm.endDateOpen = false;
          break;
      }
    }

    function dateSelected () {
      switch (selectedDatePicker) {
        case 'startDate':
          if (angular.isUndefined(vm.osemStartDate) || vm.osemStartDate === null) {
            vm.osemStartDate = new Date();
            vm.textStartDate = vm.osemPlaceholderTextStartDate;
          }

          vm.osemStartDate = moment(vm.selectedDateModel).startOf('day');
          vm.textStartDate = moment(vm.osemStartDate).format('L');
          vm.dateOptionsEndDate.minDate = vm.osemStartDate.clone().add(1, 'days').toDate();

          close('startDate');
          break;
        case 'endDate':
          if (angular.isUndefined(vm.osemEndDate) || vm.osemEndDate === null) {
            vm.osemEndDate = new Date();
            vm.textEndDate = vm.osemPlaceholderTextEndDate;
          }

          vm.osemEndDate = moment(vm.selectedDateModel).startOf('day');
          vm.textEndDate = moment(vm.osemEndDate).format('L');
          vm.dateOptionsStartDate.maxDate = vm.osemEndDate.toDate();

          close('endDate');
          break;
      }

      if (moment.isMoment(vm.osemStartDate) &&
        moment.isMoment(vm.osemEndDate)) {
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
      vm.osemStartDate = undefined;
      vm.textStartDate = vm.osemPlaceholderTextStartDate;
      vm.osemEndDate = undefined;
      vm.textEndDate = vm.osemPlaceholderTextEndDate;

      vm.dateOptionsStartDate.maxDate = moment().startOf('day').toDate();
      vm.dateOptionsEndDate.minDate = null;
      vm.dateOptionsEndDate.maxDate = moment().startOf('day').toDate();

      executeCallback(vm.onClear);
    }

    function setRange (number, type) {
      vm.osemEndDate = moment();
      vm.textEndDate = moment(vm.osemEndDate).format('L');
      vm.osemStartDate = moment(vm.osemEndDate).subtract(number, type);
      vm.textStartDate = moment(vm.osemStartDate).format('L');

      vm.dateOptionsStartDate.maxDate = vm.osemEndDate.toDate();
      vm.dateOptionsEndDate.minDate = vm.osemStartDate.clone().add(1, 'days').toDate();

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
  }
})();
