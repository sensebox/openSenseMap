'use strict';

describe('Service: OpenSenseBoxesSensors', function () {

  // load the service's module
  beforeEach(module('openSenseMapApp'));

  // instantiate service
  var OpenSenseBoxesSensors;
  beforeEach(inject(function (_OpenSenseBoxesSensors_) {
    OpenSenseBoxesSensors = _OpenSenseBoxesSensors_;
  }));

  it('should do something', function () {
    expect(!!OpenSenseBoxesSensors).toBe(true);
  });

});
