describe('cloudwatch', () => {
  const AWS = require('aws-sdk');
  const cloudwatch = jest.spyOn(AWS, 'CloudWatch').mockImplementation(() => {});

  beforeAll(() => {
    require('../../src/aws/cloudwatch');
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

  // has list function
  // calls cloudwatch.listMetrics with namespace arg
  // returns Promise
  // resolves with data
  // rejects with err

});
