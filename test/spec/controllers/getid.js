'use strict';

describe('Controller: GetidCtrl', function () {

  // load the controller's module
  beforeEach(module('openSenseMapApp'));

  var GetidCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GetidCtrl = $controller('GetidCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
