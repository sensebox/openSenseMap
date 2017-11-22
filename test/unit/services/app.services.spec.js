describe('app.services module', function() {
  beforeEach(function () {
    bard.appModule('app.services');
  });

  describe('LocalStorageService', function() {
    beforeEach(function () {
      bard.inject('LocalStorageService');
    });

    it('should exist', function () {
      expect(LocalStorageService).to.be.defined;
    });
  });

  describe('AuthenticationService', function () {
    beforeEach(function () {
      bard.inject('AuthenticationService');
    });

    it('should exist', function () {
      expect(AuthenticationService).to.be.defined;
    });
  });
});
