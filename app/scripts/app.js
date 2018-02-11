'use strict';

angular
  .module('openSenseMapApp', [
    'app.core',
    'app.models',
    'app.services',
    'ngResource',
    'ngSanitize',
    'ngDialog',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'osemFilters',
    'flow',
    'pascalprecht.translate',
    'ui.router',
    'angularMoment',
    'tmh.dynamicLocale',
    'ngProgress',
    'rzModule',
    'mgo-angular-wizard',
    'angular-toArrayFilter',
    'ismobile'
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
        controller: 'MapController',
        controllerAs: 'map',
        templateUrl: 'views/explore2.map.html'
      })
      .state('explore.map.sidebar', {
        url: 'explore',
        resolve: { /* @ngInject */
          Sidebar: function ($rootScope, $window) {
            var vm = this;
            vm.title = '';
            vm.translationId = '';
            vm.actions = [];

            return {
              getTitle: function () {
                return vm.title;
              },
              setTitle: function (title) {
                vm.title = title;
                $rootScope.$broadcast('sidebar:titleChanged', {});
              },
              setTranslationId: function (id) {
                vm.translationId = id;
              },
              getTranslationId: function () {
                return vm.translationId;
              },
              getActions: function () {
                return vm.actions;
              },
              addAction: function (action) {
                vm.actions.push(action);
              },
              removeActions: function () {
                vm.actions = [];
              }
            };
          }
        },
        views: {
          'sidebar': {
            controller: 'SidebarController',
            controllerAs: 'sidebar',
            templateUrl: 'views/sidebar.html',
          }
        }
      })
      .state('explore.map.sidebar.error', {
        url: '^/error',
        views: {
          'sidebarContent': {
            controller: 'SidebarErrorController',
            controllerAs: 'error',
            templateUrl: 'views/sidebar.error.html'
          }
        }
      })
      .state('explore.map.sidebar.boxdetails', {
        url: '/:id', // no leading / because it is a child of the 'explore' state
        views: {
          'sidebarContent': {
            controller: 'SidebarBoxDetailsController',
            controllerAs: 'details',
            templateUrl: 'views/explore2.sidebar.box.html',
          }
        }
      })
      .state('explore.map.sidebar.filter', {
        url: '^/filter',
        views: {
          'sidebarContent': {
            controller: 'SidebarFilterController',
            controllerAs: 'filter',
            templateUrl: 'views/explore2.sidebar.filter.html'
          }
        }
      })
      .state('explore.map.sidebar.download', {
        url: '^/download',
        views: {
          'sidebarContent': {
            controller: 'SidebarDownloadController',
            controllerAs: 'download',
            templateUrl: 'views/explore2.sidebar.download.html'
          }
        }
      })
      .state('explore.map.sidebar.interpolation', {
        url: '^/interpolation',
        views: {
          'sidebarContent': {
            controller: 'InterpolationController',
            controllerAs: 'interpolation',
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
      .state('account.dataupload', {
        url: '/:id/dataupload',
        views: {
          'account': {
            controller: 'DataUploadController',
            controllerAs: 'dataupload',
            templateUrl: 'views/account.box.dataupload.html'
          }
        },
        params: {
          box: {}
        }
      })
      .state('account.edit', {
        url: '/:id/edit',
        params: {
          box: { }
        },
        resolve: { /* @ngInject */
          boxData: function ($state, $stateParams, AccountService) {
            // Resolve boxData if called directly by URL
            // $stateParams.box is set if called from account dashboard
            if (angular.equals({}, $stateParams.box)) {
              return AccountService.getUsersBoxes()
                .then(function (response) {
                  for (var i = response.length - 1; i >= 0; i--) {
                    if (response[i]._id === $stateParams.id) {
                      return response[i];
                    }
                  }
                  throw 'box not found';
                })
                .catch(function (error) {
                  console.error(error);
                  $state.go('account.dashboard');
                });
            }
            return $stateParams.box;
          },
          notifications: function ($translate, boxData) {
            var vm = this;
            vm.alerts = [];
            return {
              getAlerts: function () {
                return vm.alerts;
              },
              addAlert: function (type, messageId) {
                vm.alerts.pop();
                $translate(messageId, {boxId: boxData._id}).then(function (translation) {
                  vm.alerts.push({ type: type, msg: translation });
                });
              },
              closeAlert: function (index) {
                vm.alerts.splice(index, 1);
              }
            };
          }
        },
        views: {
          'account': {
            controller: 'EditBoxController',
            controllerAs: 'edit',
            templateUrl: 'views/account.box.edit.html'
          }
        }
      })
      .state('account.edit.general', {
        url: '/general',
        views: {
          'edit': {
            controller: 'EditBoxGeneralController',
            controllerAs: 'general',
            templateUrl: 'views/account.box.edit.general.html'
          }
        }
      })
      .state('account.edit.sensors', {
        url: '/sensors',
        views: {
          'edit': {
            controller: 'EditBoxSensorsController',
            controllerAs: 'sensors',
            templateUrl: 'views/account.box.edit.sensors.html'
          }
        }
      })
      .state('account.edit.extensions', {
        url: '/extensions',
        views: {
          'edit': {
            controller: 'EditBoxExtensionsController',
            controllerAs: 'extensions',
            templateUrl: 'views/account.box.edit.extensions.html'
          }
        }
      })
      .state('account.edit.location', {
        url: '/location',
        views: {
          'edit': {
            controller: 'EditBoxLocationController',
            controllerAs: 'location',
            templateUrl: 'views/account.box.edit.location.html'
          }
        }
      })
      .state('account.edit.script', {
        url: '/script',
        views: {
          'edit': {
            controller: 'EditBoxScriptController',
            controllerAs: 'script',
            templateUrl: 'views/account.box.edit.script.html'
          }
        }
      })
      .state('account.edit.mqtt', {
        url: '/mqtt',
        views: {
          'edit': {
            controller: 'EditBoxMqttController',
            controllerAs: 'mqtt',
            templateUrl: 'views/account.box.edit.mqtt.html'
          }
        }
      })
      .state('account.edit.ttn', {
        url: '/ttn',
        views: {
          'edit': {
            controller: 'EditBoxTtnController',
            controllerAs: 'ttn',
            templateUrl: 'views/account.box.edit.ttn.html'
          }
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
      .state('account.settings', {
        url: '/settings',
        views: {
          'account': {
            controller: 'AccountSettingsController',
            controllerAs: 'settings',
            templateUrl: 'views/account.settings.html'
          }
        }
      })
      .state('account.changepassword', {
        url: '/settings/changepassword',
        views: {
          'account': {
            controller: 'AccountSettingsChangePasswordController',
            controllerAs: 'changepassword',
            templateUrl: 'views/account.settings.changepassword.html'
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
        },
        data: {
          requiresLogin: false
        }
      })
      .state('account.confirm', {
        url: '/confirm-email?email&token',
        views: {
          'account': {
            controller: 'ConfirmEmailController',
            controllerAs: 'confirm',
            templateUrl: 'views/account.confirm.html'
          }
        },
        data: {
          requiresLogin: false
        }
      })
      .state('account.register', {
        url: '/register',
        views: {
          'account': {
            controller: 'RegisterController',
            controllerAs: 'register',
            templateUrl: 'views/register.html'
          }
        }
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/registration.html',
        controller: 'SignupLoginController',
        controllerAs: 'account'
      })
      .state('info', {
        url: '/info',
        templateUrl: 'views/info.html',
        controller: 'InfoController',
        controllerAs: 'info'
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

  .run(['LanguageService', function (LanguageService) {
    LanguageService.initialize();
  }])

  .filter('unsafe', ['$sce', function($sce){
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  }])

  .factory('FilterActiveService', function(){
    return { active: false };
  });
