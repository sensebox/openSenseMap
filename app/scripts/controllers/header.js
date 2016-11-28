(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('HeaderController', HeaderController)

  function HeaderController ($translate, amMoment, tmhDynamicLocale) {
    var vm = this

    vm.key = 'de_DE'
    vm.counts = {
      boxes: '',
      measurements: ''
    }

    vm.changeLanguage = function (key) {
      $translate.use(key).then(function (key) {
        vm.key = key.split('_')[0]
        amMoment.changeLocale(vm.key)
        tmhDynamicLocale.set(vm.key)
      }, function (key) {
      })
    }
  }
})()
