'use strict';

describe('Controller: ExploreCtrl', function () {

  // load the controller's module
  beforeEach(module('openSenseMapApp'));

  var ExploreCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExploreCtrl = $controller('ExploreCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
