describe('stat', () => {

  const express = require('express'),
    request = require('supertest');

  const mockValidNamespaces = { MockNamespace: 'validNamespace' },
    mockValidRegions = { MockRegion: 'mockRegion' },
    mockValidStats = { MockStat: 'mockStat' },
    mockStatResponse = { not: 'implemented' };    // TODO this should be the struct from aws...

  let app, target, status, json, mockCloudwatchGet, mockCloudwatchGetFails, mockGetDimensionsFails;

  const dateTolerance = 100;

  beforeAll(() => {
    jest.mock('../../src/data/namespaces', () => (mockValidNamespaces));
    jest.mock('../../src/data/regions', () => (mockValidRegions));
    jest.mock('../../src/data/statistics', () => (mockValidStats));

    mockGetDimensionsFails = false;
    jest.mock('../../src/util/getDimensions', () => {
      return () => new Promise((resolve, reject) => {
        (mockGetDimensionsFails) ? reject(new Error('mockError')) : resolve(['mockDimensions']);
      });
    });

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
      { uri: '/validNamespace/metric?region=invalidRegion', condition: 'invalid region'  },
      { uri: '/validNamespace/metric?region=mockRegion&stat=invalidStat', condition: 'invalidStat'  }
    ];
    beforeEach(() => status.mockClear());
    assertions404.forEach((assertion) => {
      test(`if ${assertion.condition}`, (done) => {
        request(app).get(assertion.uri).then(() => {
          expect(status).toHaveBeenCalledWith(404);
          done();
        });
      });
    });
  });

  describe('calls cloudwatch.get with correct params', () => {
    beforeAll((done) => {
      mockCloudwatchGet.mockClear();
      request(app).get('/validNamespace/mockMetric?region=mockRegion&age=99999&regex=poop&stat=mockStat').then(done).catch(done);
    });
    test('namespace', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ namespace: 'aws/validNamespace'.toUpperCase() })); });
    test('metric', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ metric: 'mockMetric' })); });
    test('region', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ region: 'mockRegion' })); });
    test('stat', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ stat: 'mockStat' })); });
    test('start', () => {
      const expected = new Date(Date.now() - 99999),
        actual = new Date(mockCloudwatchGet.mock.calls[0][0].start);
      const isWithinTolerance = (expected - actual > -(dateTolerance / 2)) && (expected - actual < (dateTolerance / 2));
      expect(isWithinTolerance).toBe(true);
    });
    test('dimensions', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ dimensions: ['mockDimensions'] })); });
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
    test('region is eu-west-2', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ region: 'eu-west-2' })); });
    test('stat is Average', () => { expect(mockCloudwatchGet).toHaveBeenCalledWith(expect.objectContaining({ stat: 'Average' })); });
  });

  describe('response', () => {
    beforeEach(() => {
      json.mockClear();
      status.mockClear();
    });
    test('responds with Metrics when cloudwatch promise resolves', (done) => {
      request(app).get('/validNamespace/mockMetric').then(() => {
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ response: mockStatResponse }));
        done();
      });
    });
    test('responds with Options when cloudwatch promise resolves', (done) => {
      request(app).get('/validNamespace/mockMetric?region=mockRegion&age=99999&regex=poop&stat=mockStat').then(() => {
        expect(json).toHaveBeenCalledWith(expect.objectContaining({
          options: {
            dimensions: ['mockDimensions'],
            metric: 'mockMetric',
            namespace: 'AWS/VALIDNAMESPACE',
            regex: 'poop',
            region: 'mockRegion',
            stat: 'mockStat',
            start: expect.anything()
          }
        }));
        done();
      });
    });
    test('responds with status 500 when cloudwatch promise rejects', (done) => {
      mockCloudwatchGetFails = true;
      request(app).get('/validNamespace/mockMetric').then(() => {
        expect(status).toHaveBeenCalledWith(500);
        done();
      });
    });
    test('responds with status 500 when getDimensions promise rejects', (done) => {
      mockCloudwatchGetFails = false;
      mockGetDimensionsFails = true;
      request(app).get('/validNamespace/mockMetric').then(() => {
        expect(status).toHaveBeenCalledWith(500);
        done();
      });
    });

  });

});
