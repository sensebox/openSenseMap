'use strict';

describe('Service: OpenSenseBox', function () {

  // load the service's module
  beforeEach(module('openSenseMapApp'));

  // instantiate service
  var OpenSenseBox;
  beforeEach(inject(function (_OpenSenseBox_) {
    OpenSenseBox = _OpenSenseBox_;
  }));

  it('should do something', function () {
    expect(!!OpenSenseBox).toBe(true);
  });

});
