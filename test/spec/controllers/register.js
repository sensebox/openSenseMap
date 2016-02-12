'use strict';

describe('Controller: RegisterCtrl', function () {

  // load the controller's module
  beforeEach(module('openSenseMapApp'));

  var RegisterCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RegisterCtrl = $controller('RegisterCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.alerts.length).toBe(0);
    expect(scope.editing).toBeDefined();
    expect(scope.isCustom).toBeDefined();
    expect(scope.models).toBeDefined();
  });
});
