(function () {
  'use strict';

  /**
   * This service is intended for resolving all boxes when changing states, in
   * order to load make boxes with the correct amount of metadata available to
   * the controller. It..
   * - wraps the getBoxes API with a ng-progressbar
   * - makes sure all boxes are only fetched once with full metadata
   * - allows to fetch boxes with minimal metadata
   */

  angular.module('app.services').factory('BoxesService', BoxesService);

  BoxesService.$inject = ['OpenSenseMapAPI', 'ngProgressFactory'];

  function BoxesService (OpenSenseMapAPI, ngProgressFactory) {
    var fullMetadataLoaded = false;
    var boxes = null;

    return {
      getBoxesMinimal: getBoxesMinimal,
      getBoxesFullMetadata: getBoxesFullMetadata
    };

    function getBoxesMinimal () {
      if (!boxes) {
        return getBoxesWithProgress({ minimal: true, classify: true }).then(
          function (response) {
            boxes = response;

            return boxes;
          }
        );
      }

      return Promise.resolve(boxes);
    }

    function getBoxesFullMetadata () {
      if (!fullMetadataLoaded) {
        return getBoxesWithProgress({ minimal: false, classify: true }).then(
          function (response) {
            fullMetadataLoaded = true;
            boxes = response;

            return boxes;
          }
        );
      }

      return Promise.resolve(boxes);
    }

    function getBoxesWithProgress (params) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.setColor('#4EAF47');
      progressbar.start();

      return OpenSenseMapAPI.getBoxes({ params: params })
        .then(function (data) {
          progressbar.complete();

          return data;
        })
        .catch(function () {
          progressbar.complete();

          return new Error('Could not resolve getBoxes()');
        });
    }
  }
})();
