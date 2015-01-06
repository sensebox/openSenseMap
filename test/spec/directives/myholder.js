'use strict';

describe('Directive: myHolder', function () {

  // load the directive's module
  beforeEach(module('openSenseMapApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<my-holder></my-holder>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the myHolder directive');
  }));
});
