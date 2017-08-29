describe('list', () => {

  const express = require('express'),
    request = require('supertest');

  let app, target, json, status, mockCloudwatchList, mockCloudwatchListFails;

  const mockMetrics = { Metrics: 'mockMetrics' };

  const assertions = [
    { key: 'regions', value: { MockRegion: 'mockRegion' }, path: '../../src/data/regions' },
    { key: 'namespaces', value: { MockNamespace: 'validNamespace' }, path: '../../src/data/namespaces' },
    { key: 'statistics', value: ['MockValidStatistics'], path: '../../src/data/statistics' },
    { key: 'periods', value: { MockPeriod: 'mockPeriod' }, path: '../../src/data/periods' }
  ];

  beforeAll(() => {
    assertions.forEach(assertion => jest.mock(assertion.path, () => (assertion.value)));

    mockCloudwatchListFails = false;
    mockCloudwatchList = jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        (mockCloudwatchListFails) ? reject(new Error('mockError')) : resolve(mockMetrics);
      });
    });

    jest.mock('../../src/aws/cloudwatch', () => ({
      list: mockCloudwatchList
    }));

    json = jest.spyOn(express.response, 'json');
    status = jest.spyOn(express.response, 'status');

    target = require('../../src/router/list');

    app = express();
    app.use('/', target);

  });

  afterEach(() => {
    status.mockClear();
  });

  describe('/ route', () => {
    beforeAll((done) => {
      request(app).get('/').then(done).catch(done);
    });

    assertions.forEach((assertion) => {
      test(`lists ${assertion.key}`, () => {
        const expectation = {};
        expectation[`${assertion.key}`] = assertion.value;
        expect(json).toHaveBeenCalledWith(expect.objectContaining(expectation));
      });
    });
  });

  describe('invalid namespace', () => {
    test('is 404', (done) => {
      request(app).get('/invalidNamespace').then(() => {
        expect(status).toHaveBeenCalledWith(404);
        done();
      }).catch(done);
    });
  });

  describe('valid namespace', () => {
    beforeAll((done) => {
      request(app).get('/validNamespace').then(done);
    });

    test('calls cloudwatch, with uppered namespace, prefixed with AWS/', () => {
      expect(mockCloudwatchList).toHaveBeenCalledWith('AWS/VALIDNAMESPACE', expect.anything());
    });
    test('default region is eu-west-2', () => {
      expect(mockCloudwatchList).toHaveBeenCalledWith(expect.anything(), 'eu-west-2');
    });
    test('responds with Metrics when promise resolves', () => {
      expect(json).toHaveBeenCalledWith('mockMetrics');
    });
    test('responds with status 500 when promise rejects', (done) => {
      mockCloudwatchListFails = true;
      request(app).get('/validNamespace').then(() => {
        expect(status).toHaveBeenCalledWith(500);
        done();
      }).catch(done);
    });
    test('calls cloudwatch with region in querystring', (done) => {
      mockCloudwatchListFails = false;
      request(app).get('/validNamespace?region=mockRegion').then(() => {
        expect(mockCloudwatchList).toHaveBeenCalledWith(expect.anything(), 'mockRegion');
        done();
      }).catch(done);
    });

  });

});
