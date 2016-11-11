(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('SidebarController', SidebarController)

  function SidebarController () {
    var vm = this
    vm.a = 'a'
  }
})()
