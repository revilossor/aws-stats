describe('cloudwatch', () => {
  const AWS = require('aws-sdk');
  let listMetricsErrors = false;
  let getMetricsErrors = false;
  const listMetrics = jest.fn().mockImplementation((opts, cb) => {
    cb(
      (listMetricsErrors) ? new Error('mockError') : undefined,
      (listMetricsErrors) ? undefined : 'mockData'
    );
  });
  const getMetricStatistics = jest.fn().mockImplementation((opts, cb) => {
    cb(
      (getMetricsErrors) ? new Error('mockError') : undefined,
      (getMetricsErrors) ? undefined : 'mockData'
    );
  });
  const cloudwatch = jest.spyOn(AWS, 'CloudWatch').mockImplementation(() => {
    const Mock = function(){};
    Mock.listMetrics = listMetrics;
    Mock.getMetricStatistics = getMetricStatistics;
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
      cloudwatch.mockClear();
      response = target.get({
        namespace: 'mockNamespace',
        metric: 'mockMetric',
        start: 'mockStart',
        dimensions: ['mockDimension'],
        region: 'mockRegion',
        period: 'mockPeriod',
        stat: ['mockStatistics']
      });
    });
    test('function exists', () => {
      expect(target.get).toBeDefined();
      expect(target.get).toBeInstanceOf(Function);
    });
    test('uses correct API version', () => {
      expect(cloudwatch).toHaveBeenCalledWith(expect.objectContaining({ apiVersion: '2010-08-01' }));
    });
    test('uses correct region', () => {
      expect(cloudwatch).toHaveBeenCalledWith(expect.objectContaining({ region: 'mockRegion' }));
    });
    describe('uses correct options', () => {
      test('StartTime',   () => { expect(getMetricStatistics).toHaveBeenCalledWith(expect.objectContaining({ StartTime: 'mockStart' }), expect.anything()); });
      test('MetricName',  () => { expect(getMetricStatistics).toHaveBeenCalledWith(expect.objectContaining({ MetricName: 'mockMetric' }), expect.anything()); });
      test('Namespace',   () => { expect(getMetricStatistics).toHaveBeenCalledWith(expect.objectContaining({ Namespace: 'mockNamespace' }), expect.anything()); });
      test('Period',      () => { expect(getMetricStatistics).toHaveBeenCalledWith(expect.objectContaining({ Period: 'mockPeriod' }), expect.anything()); });
      test('Statistics',  () => { expect(getMetricStatistics).toHaveBeenCalledWith(expect.objectContaining({ Statistics: ['mockStatistics'] }), expect.anything()); });
      test('Dimensions',  () => { expect(getMetricStatistics).toHaveBeenCalledWith(expect.objectContaining({ Dimensions: ['mockDimension'] }), expect.anything()); });
    });
    describe('return', () => {
      test('is a promise', () => {
        expect(response).toBeInstanceOf(Promise);
      });
      test('resolves with data', (done) => {
        response.then((data) => {
          expect(data).toBe('mockData');
          done();
        });
      });
      test('rejects with error', (done) => {
        getMetricsErrors = true;
        target.get({
          namespace: 'mockNamespace',
          metric: 'mockMetric',
          start: 'mockStart',
          dimensions: ['mockDimension'],
          region: 'mockRegion'
        }).catch((err) => {
          expect(err).toBeInstanceOf(Error);
          done();
        });
      });

    });


  });

});
