describe('list', () => {

  const express = require('express'),
    request = require('supertest');

  let app, target, json, status;

  const mockValidNamespaces = {
    MockNamespace: 'mock_namespace'
  };

  beforeAll(() => {
    jest.mock('../../src/data/namespaces', () => (mockValidNamespaces));

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
    test('responds 200 with the namespace module as json', (done) => {
      request(app).get('/').then(() => {
        expect(json).toHaveBeenCalledWith(expect.objectContaining(mockValidNamespaces));
        done();
      });
    });
  });

  describe('invalid namespace', () => {
    test('is 404', () => {
      request(app).get('/invalidNamespace').then(() => {
        expect(status).toHaveBeenCalledWith(404);
      });
    });
  });


  // valid namespaces
  // calls cloudwatch.list, with namespace uppered
  // on resolve, res.json with response.metrics
  // on reject, 500s, res.json with error

});
