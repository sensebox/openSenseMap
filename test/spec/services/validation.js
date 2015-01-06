'use strict';

describe('Service: validation', function () {

  // load the service's module
  beforeEach(module('openSenseMapApp'));

  // instantiate service
  var validation;
  beforeEach(inject(function (_validation_) {
    validation = _validation_;
  }));

  it('should do something', function () {
    expect(!!validation).toBe(true);
  });

});
