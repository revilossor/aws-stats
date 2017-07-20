describe('cloudwatch', () => {
  const AWS = require('aws-sdk');
  let listMetricsErrors = false;
  const listMetrics = jest.fn().mockImplementation((opts, cb) => {
    cb(
      (listMetricsErrors) ? new Error('mockError') : undefined,
      (listMetricsErrors) ? undefined : 'mockData'
    );
  });
  const cloudwatch = jest.spyOn(AWS, 'CloudWatch').mockImplementation(() => {
    const Mock = function(){};
    Mock.listMetrics = listMetrics;
    return Mock;
  });

  let target, response;

  beforeAll(() => {
    target = require('../../src/aws/cloudwatch');
  });

  describe('list()', () => {
    beforeAll(() => {
      response = target.list('mockNamespace', 'mockRegion');
    });
    test('function exists', () => {
      expect(target.list).toBeDefined();
      expect(target.list).toBeInstanceOf(Function);
    });
    test('uses correct API version', () => {
      expect(cloudwatch).toHaveBeenCalledWith(expect.objectContaining({ apiVersion: '2010-08-01' }));
    });
    test('uses correct region', () => {
      expect(cloudwatch).toHaveBeenCalledWith(expect.objectContaining({ region: 'mockRegion' }));
    });
    test('calls listMetrics with passed namespace', () => {
      expect(listMetrics).toHaveBeenCalledWith(expect.objectContaining({ Namespace: 'mockNamespace' }), expect.anything());
    });
    test('returns a promise', () => {
      expect(response).toBeInstanceOf(Promise);
    });
    test('promise resolves with data', (done) => {
      response.then((data) => {
        expect(data).toBe('mockData');
        done();
      });
    });
    test('promise rejects with error', (done) => {
      listMetricsErrors = true;
      target.list('something').catch((error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      });
    });
  });

  describe('get()', () => {
    beforeAll(() => {
      response = target.get({});
    });
    test('function exists', () => {
      expect(target.get).toBeDefined();
      expect(target.list).toBeInstanceOf(Function);
    });
  });

});
