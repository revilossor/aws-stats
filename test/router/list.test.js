describe('list', () => {

  const express = require('express'),
    request = require('supertest');

  let app, target, json, status, mockCloudwatchList, mockCloudwatchListFails;

  const mockValidNamespaces = {
    MockNamespace: 'validNamespace'
  };

  const mockMetrics = {
    Metrics: 'mockMetrics'
  };

  beforeAll(() => {
    jest.mock('../../src/data/namespaces', () => (mockValidNamespaces));

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
    json.mockClear();
  });

  describe('/ route', () => {
    test('responds 200 with the namespace module as json', (done) => {
      request(app).get('/').then(() => {
        expect(json).toHaveBeenCalledWith(expect.objectContaining(mockValidNamespaces));
        done();
      });
    });
  });

  describe('invalid namespace', () => {
    test('is 404', (done) => {
      request(app).get('/invalidNamespace').then(() => {
        expect(status).toHaveBeenCalledWith(404);
        done();
      });
    });
  });

  describe('valid namespace', () => {
    test('calls cloudwatch, with uppered namespace, prefixed with AWS/', (done) => {
      request(app).get('/validNamespace').then(() => {
        expect(mockCloudwatchList).toHaveBeenCalledWith('AWS/VALIDNAMESPACE');
        done();
      });
    });
    test('responds with Metrics when promise resolves', (done) => {
      request(app).get('/validNamespace').then(() => {
        expect(json).toHaveBeenCalledWith('mockMetrics');
        done();
      });
    });
    test('responds with status 500 when promise rejects', (done) => {
      mockCloudwatchListFails = true;
      request(app).get('/validNamespace').then(() => {
        expect(status).toHaveBeenCalledWith(500);
        done();
      });
    });
  });

});
