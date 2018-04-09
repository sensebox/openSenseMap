'use strict';

const request = require('request-promise-native'),
  got = require('got'),
  moment = require('moment');

const BASE_URL = 'https://api.testing.opensensemap.org',
  valid_sensebox = require('./data/valid_sensebox');

const numBoxes = 10;
const numMeasurementBatches = 100;

const handlePostBox = function (response) {
  const boxId = response.data._id;

  return request.get({ url: `${BASE_URL}/boxes/${boxId}`, json: true });
};

const postMeasurements = function (response) {
  const boxId = response._id;
  const sensorIds = response.sensors.map(s => s._id);
  const basetimestamp = moment.utc();
  let str = '';
  const mapSensorId = function (id, index) {
    const ts = basetimestamp
      .clone()
      .subtract(index + Math.random() * 120, 'minutes')
      .toISOString();

    return `${id},${(index + 1 + Math.random() * 10).toFixed(0)},${ts}`;
  };

  for (let i = 0; i <= numMeasurementBatches; i++) {
    str = `${str}\n${sensorIds.map(mapSensorId).join('\n')}`;
  }
  // console.log('--------- POSTING MEASUREMENTS ----------');
  // console.log(str);
  // console.log('--------- END POSTING -------------');
  // console.log();
  // console.log();
  // console.log();

  return request.post({
    url: `${BASE_URL}/boxes/${boxId}/data`,
    headers: { 'content-type': 'text/csv' },
    body: str
  });
};

const catchErr = function (err) {
  /* eslint-disable no-console */
  console.log('Error:', err);
  /* eslint-enable no-console */
};

request
  .post({
    url: `${BASE_URL}/users/register`,
    body: { name: 'boxslave', email: 'quark@aadas2.ads', password: 'test1234' },
    json: true
  })
  .then(function (response) {
    const jwt = response.token;
    for (let i = 1; i <= numBoxes; i++) {
      request
        .post({
          url: `${BASE_URL}/boxes`,
          body: valid_sensebox({
            model: 'homeEthernet',
            bbox: [13, 52.3, 14, 52.7]
          }),
          json: true,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${jwt}`
          }
        })
        .then(handlePostBox)
        .then(postMeasurements)
        .catch(catchErr);
    }
  })
  .catch(catchErr);
