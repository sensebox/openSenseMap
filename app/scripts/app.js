(function () {
  'use strict'

  angular
    .module('openSenseMapApp', [
      'ngResource',
      'ngSanitize',
      'ngRoute',
      'ngDialog',
      'ui-leaflet',
      'ui.bootstrap',
      'ui.checkbox',
      'osemFilters',
      'angular-underscore',
      'rcWizard',
      'rcForm',
      'flow',
      'pascalprecht.translate',
      'ui.router',
      'gridshore.c3js.chart',
      'angularMoment',
      'tmh.dynamicLocale'
    ])
    .config(routeConfig)
    .config(translateConfig)

  function routeConfig ($locationProvider, $stateProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true)

    $urlRouterProvider.otherwise('/')

    $stateProvider
      .state('explore', {
        url: '/',
        abstract: true,
        templateUrl: 'views/explore2.html'
      })
      .state('explore.map', {
        url: '',
        controller: 'MapController as map',
        templateUrl: 'views/explore2.map.html'
      })
      .state('explore.map.boxdetails', {
        url: 'explore/:id', // no leading / because it is a child of the 'explore' state
        views: {
          'sidebar': {
            controller: 'SidebarBoxDetailsController as boxDetails',
            templateUrl: 'views/explore2.sidebar.box.html'
          }
        }
      })
      .state('explore.map.filter', {
        url: 'filter',
        views: {
          'sidebar': {
            controller: 'SidebarFilterController as filter',
            templateUrl: 'views/explore2.sidebar.filter.html'
          }
        }
      })
      .state('explore.map.download', {
        url: 'download',
        views: {
          'sidebar': {
            controller: 'SidebarDownloadController as download',
            templateUrl: 'views/explore2.sidebar.download.html'
          }
        }
      })
      .state('explore.map.interpolation', {
        url: 'interpolation',
        views: {
          'sidebar': {
            controller: 'InterpolationController as interpolation',
            templateUrl: 'views/explore2.sidebar.interpolation.html'
          }
        }
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'RegisterController as register'
      })
      .state('info', {
        url: '/info',
        templateUrl: 'views/info.html'
      })
  }

  function translateConfig ($translateProvider, tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('translations/angular/angular-locale_{{locale}}.js')

    $translateProvider.useStaticFilesLoader({
      prefix: '../translations/',
      suffix: '.json'
    })
    $translateProvider.use('de_DE')
    $translateProvider.fallbackLanguage('en_US')
    $translateProvider.preferredLanguage('de_DE')
    $translateProvider.determinePreferredLanguage()
    $translateProvider.useSanitizeValueStrategy('escaped')
  }
})()
