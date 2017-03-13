'use strict';

angular
  .module('openSenseMapApp', [
    'ngResource',
    'ngSanitize',
    'ngDialog',
    'ui-leaflet',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'osemFilters',
    'flow',
    'pascalprecht.translate',
    'ui.router',
    'gridshore.c3js.chart',
    'angularMoment',
    'tmh.dynamicLocale',
    'ngProgress',
    'rzModule',
    'mgo-angular-wizard',
    'angular-toArrayFilter'
  ])
  .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider', '$logProvider', 'tmhDynamicLocaleProvider', function ($stateProvider, $httpProvider, $urlRouterProvider, $locationProvider, $compileProvider, $logProvider, tmhDynamicLocaleProvider) {
    $compileProvider.debugInfoEnabled(false);
    $logProvider.debugEnabled(false);

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('AuthenticationInterceptor');

    $urlRouterProvider.otherwise('/');

    tmhDynamicLocaleProvider.localeLocationPattern('translations/angular/angular-locale_{{locale}}.js');

    $stateProvider
      .state('explore', {
        url: '/',
        abstract: true,
        templateUrl: 'views/explore2.html'
      })
      .state('explore.map', {
        url: '',
        controller: 'MapCtrl',
        templateUrl: 'views/explore2.map.html'
      })
      .state('explore.map.boxdetails', {
        url: 'explore/:id', // no leading / because it is a child of the 'explore' state
        views: {
          'sidebar': {
            controller: 'SidebarBoxDetailsCtrl',
            templateUrl: 'views/explore2.sidebar.box.html'
          }
        }
      })
      .state('explore.map.filter', {
        url: 'filter',
        views: {
          'sidebar': {
            controller: 'SidebarFilterCtrl',
            templateUrl: 'views/explore2.sidebar.filter.html'
          }
        }
      })
      .state('explore.map.download', {
        url: 'download',
        views: {
          'sidebar': {
            controller: 'SidebarDownloadCtrl',
            templateUrl: 'views/explore2.sidebar.download.html'
          }
        }
      })
      .state('explore.map.interpolation', {
        url: 'interpolation',
        views: {
          'sidebar': {
            controller: 'InterpolationCtrl',
            templateUrl: 'views/explore2.sidebar.interpolation.html'
          }
        }
      })
      .state('account', {
        url: '/account',
        abstract: true,
        templateUrl: 'views/account.html',
        data: {
          requiresLogin: true
        }
      })
      .state('account.dashboard', {
        url: '',
        views: {
          'account': {
            controller: 'AccountDashboardController',
            controllerAs: 'dashboard',
            templateUrl: 'views/account.dashboard.html'
          }
        }
      })
      .state('account.reset', {
        url: '/password-reset?token',
        views: {
          'account': {
            controller: 'PasswordResetController',
            controllerAs: 'reset',
            templateUrl: 'views/account.reset.html'
          }
        }
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .state('info', {
        url: '/info',
        templateUrl: 'views/info.html'
      });
  }])
  .config(['$translateProvider', function ($translateProvider){
    $translateProvider.useStaticFilesLoader({
        prefix: '../translations/',
        suffix: '.json'
      });
    $translateProvider.use('de_DE');
    $translateProvider.fallbackLanguage('en_US');
    $translateProvider.preferredLanguage('de_DE');
    $translateProvider.determinePreferredLanguage();
    $translateProvider.useSanitizeValueStrategy('escaped');
  }])

  .run(function($rootScope, $state, SignupLoginService) {
    $rootScope.$on('$stateChangeStart', function(e, to) {
      if (to.data && to.data.requiresLogin) {
        if (!SignupLoginService.isAuthed()) {
          e.preventDefault();
          $state.go('explore.map');
        }
      }
    });
  })

  .filter('unsafe', ['$sce', function($sce){
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  }])

  .factory('FilterActiveService', function(){
    return { active: false };
  });
