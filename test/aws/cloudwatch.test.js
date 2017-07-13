describe('cloudwatch', () => {
  const AWS = require('aws-sdk');
  const listMetrics = jest.fn();
  const cloudwatch = jest.spyOn(AWS, 'CloudWatch').mockImplementation(() => {
    const Mock = function(){};
    Mock.listMetrics = listMetrics;
    return Mock;
  });

  let target;

  beforeAll(() => {
    target = require('../../src/aws/cloudwatch');
  });

  describe('init', () => {
    test('uses correct API version', () => {
      expect(cloudwatch).toHaveBeenCalledWith(expect.objectContaining({
        apiVersion: '2010-08-01'
      }));
    });
    test('uses correct region', () => {
      expect(cloudwatch).toHaveBeenCalledWith(expect.objectContaining({
        region: 'eu-west-2'
      }));
    });
  });

  describe.only('list()', () => {
    beforeAll(() => {
      target.list('mockNamespace');
    });
    test('function exists', () => {
      expect(target.list).toBeDefined();
      expect(target.list).toBeInstanceOf(Function);
    });
    test('calls listMetrics with passed namespace', () => {
      expect(listMetrics).toHaveBeenCalledWith(expect.objectContaining({
        Namespace: 'mockNamespace'
      }), expect.anything());
    });
  });

  // TODO returns Promise
  // resolves with data
  // rejects with err

});
