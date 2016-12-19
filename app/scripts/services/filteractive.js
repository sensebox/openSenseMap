(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .factory('FilterActive', FilterActive)

  function FilterActive () {
    return {
      active: false
    }
  }
})()
