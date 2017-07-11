'use strict';

angular
  .module('openSenseMapApp', [
    'app.services',
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
        controller: 'MapController',
        controllerAs: 'map',
        templateUrl: 'views/explore2.map.html',
        resolve: { /* @ngInject */
          boxes: function (ngProgressFactory, OpenSenseMapAPI) {
            var progressbar = ngProgressFactory.createInstance();
            progressbar.setColor("#4EAF47");
            progressbar.start();
            return OpenSenseMapAPI.getBoxes()
              .then(function (data) {
                progressbar.complete();
                return data;
              })
              .catch(function (error) {
                console.error('Resolve boxes: ', error);
                progressbar.complete();
                return error;
              });
          }
        }
      })
      .state('explore.map.boxdetails', {
        url: 'explore/:id', // no leading / because it is a child of the 'explore' state
        views: {
          'sidebar': {
            controller: 'SidebarBoxDetailsController',
            controllerAs: 'details',
            templateUrl: 'views/explore2.sidebar.box.html'
          }
        }
      })
      .state('explore.map.filter', {
        url: 'filter',
        views: {
          'sidebar': {
            controller: 'SidebarFilterController',
            controllerAs: 'filter',
            templateUrl: 'views/explore2.sidebar.filter.html'
          }
        }
      })
      .state('explore.map.download', {
        url: 'download',
        views: {
          'sidebar': {
            controller: 'SidebarDownloadController',
            controllerAs: 'download',
            templateUrl: 'views/explore2.sidebar.download.html'
          }
        }
      })
      .state('explore.map.interpolation', {
        url: 'interpolation',
        views: {
          'sidebar': {
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
                  for (var i = response.data.boxes.length - 1; i >= 0; i--) {
                    if (response.data.boxes[i]._id === $stateParams.id) {
                      return response.data.boxes[i];
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

  .run(function($rootScope, $state, AccountService) {
    $rootScope.$on('$stateChangeStart', function(e, to) {
      if (to.data && to.data.requiresLogin) {
        if (!AccountService.isAuthed()) {
          AccountService.refreshAuth()
          .then(function (response) {
            console.log("Refresh success: ", response);
            if (angular.isUndefined(response)) {
              e.preventDefault();
              $state.go('explore.map');
            }
          })
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
