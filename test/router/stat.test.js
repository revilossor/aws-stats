describe('stat', () => {

  const express = require('express'),
    request = require('supertest');

  const mockValidNamespaces = { MockNamespace: 'validNamespace' },
    mockValidRegions = { MockRegion: 'mockRegion' },
    mockStatResponse = { not: 'implemented' };    // TODO this should be the struct from aws...

  let app, target, status, json, mockCloudwatchGet, mockCloudwatchGetFails;

  const dateTolerance = 100;

  beforeAll(() => {
    jest.mock('../../src/data/namespaces', () => (mockValidNamespaces));
    jest.mock('../../src/data/regions', () => (mockValidRegions));

    mockCloudwatchGetFails = false;
    mockCloudwatchGet = jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        (mockCloudwatchGetFails) ? reject(new Error('mockError')) : resolve(mockStatResponse);
      });
    });
    jest.mock('../../src/aws/cloudwatch', () => ({ get: mockCloudwatchGet }));

    status = jest.spyOn(express.response, 'status');
    json = jest.spyOn(express.response, 'json');

    target = require('../../src/router/stat');

    app = express();
    app.use('/', target);

  });

  describe('404s', () => {
    const assertions404 = [
      { uri: '/invalidNamespace/validMetric',               condition: 'invalid namespace'  },
      { uri: '/validNamespace/',                            condition: 'no metric'          },
      { uri: '/validNamespace/metric?region=invalidRegion', condition: 'invalid namespace'  }
    ];
    assertions404.forEach((assertion) => {
      test(`if ${assertion.condition}`, (done) => {
        request(app).get(assertion.uri).then(() => {
          expect(status).toHaveBeenCalledWith(404);
          done();
        }).catch(done);
      });
    });
  });

  describe('calls cloudwatch.get with correct params', () => {
    beforeAll((done) => {
      mockCloudwatchGet.mockClear();
      request(app).get('/validNamespace/mockMetric?region=mockRegion&age=99999&regex=poop').then(done).catch(done);
    });
    test('namespace', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ namespace: 'validNamespace' })); });
    test('metric', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ metric: 'mockMetric' })); });
    test('region', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ region: 'mockRegion' })); });
    test('start', () => {
      const expected = new Date(Date.now() - 99999),
        actual = new Date(mockCloudwatchGet.mock.calls[0][0].start);
      const isWithinTolerance = (expected - actual > -(dateTolerance / 2)) && (expected - actual < (dateTolerance / 2));
      expect(isWithinTolerance).toBe(true);
    });
    test('regex', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ regex: 'poop' })); });
  });

  describe('default params', () => {
    beforeAll((done) => {
      mockCloudwatchGet.mockClear();
      request(app).get('/validNamespace/mockMetric').then(done).catch(done);
    });
    test('age is an hour', () => {
      const expected = new Date(Date.now() - 3600000),
        actual = new Date(mockCloudwatchGet.mock.calls[0][0].start);
      const isWithinTolerance = (expected - actual > -(dateTolerance / 2)) && (expected - actual < (dateTolerance / 2));
      expect(isWithinTolerance).toBe(true);
    });
    test('regex is null', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ regex: null })); });
    test('region is eu-west-2', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ region: 'eu-west-2' })); });
  });

  describe('response', () => {
    beforeAll((done) => {
      json.mockClear();
      request(app).get('/validNamespace/mockMetric').then(done);
    });
    test('responds with Metrics when promise resolves', () => {
      expect(json).toHaveBeenCalledWith(mockStatResponse);
    });
    test('responds with status 500 when promise rejects', (done) => {
      mockCloudwatchGetFails = true;
      request(app).get('/validNamespace/mockMetric').then(() => {
        expect(status).toHaveBeenCalledWith(500);
        done();
      }).catch(done);
    });
  });

});
