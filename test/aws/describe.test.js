describe('describe', () => {
  const AWS = require('aws-sdk');

  let target;

  const mockCache = {},
    mockDescribeFails = {},
    mockRawReturns = {
      EC2: {
        Reservations: [
          { Instances: [
            { Tags: [{ Key: 'Name', Value: 'MockInstanceName' }]}
          ] }
        ]
      },
      ELB: {
        LoadBalancerDescriptions: [
          { mock: 'mockELB' }
        ]
      }
    };

  const assertions = [
    {
      namespace: 'EC2',
      api: '2016-11-15',
      func: 'describeInstances',
      funcErrors: false,
      resolve: [{ Tags:[{Key:'Name', Value: 'MockInstanceName'}], InstanceName: 'MockInstanceName' }],
      mocks: {
        con: null,
        func: jest.fn().mockImplementation((opts, cb) => {
          cb(
            (mockDescribeFails.EC2) ? new Error() : null,
            (mockDescribeFails.EC2) ? null : mockRawReturns.EC2
          );
        })
      }
    },
    {
      namespace: 'ELB',
      api: '2012-06-01',
      func: 'describeLoadBalancers',
      funcErrors: false,
      resolve: [{ mock: 'mockELB' }],
      mocks: {
        con: null,
        func: jest.fn().mockImplementation((opts, cb) => {
          cb(
            (mockDescribeFails.ELB) ? new Error() : null,
            (mockDescribeFails.ELB) ? null : mockRawReturns.ELB
          );
        })
      }
    }
  ];

  assertions.forEach((assertion) => { mockDescribeFails[assertion.namespace] = false; });

  beforeAll(() => {
    assertions.forEach((assertion) => {
      assertion.mocks.con = jest.spyOn(AWS, assertion.namespace).mockImplementation(() => {
        const Mock = function(){};
        Mock[assertion.func] = assertion.mocks.func;
        return Mock;
      });
    });
    jest.mock('../../src/data/cache', () => mockCache);
    target = require('../../src/aws/describe');
  });

  assertions.forEach((assertion) => {
    describe(assertion.namespace, () => {
      beforeAll(() => {
        target[assertion.namespace]('mockRegion');
      });
      test('there is a function', () => {
        expect(target[assertion.namespace]).toBeDefined();
        expect(target[assertion.namespace]).toBeInstanceOf(Function);
      });
      describe('instantaites sdk object', () => {
        test('uses correct api version', () => {
          expect(assertion.mocks.con).toHaveBeenCalledWith(expect.objectContaining({ apiVersion: assertion.api }));
        });
        test('uses passed region', () => {
          expect(assertion.mocks.con).toHaveBeenCalledWith(expect.objectContaining({ region: 'mockRegion' }));
        });
      });
      describe('caching', () => {
        afterEach(() => {
          assertion.mocks.func.mockClear();
        });
        test('calls describe function if cache empty', () => {
          mockCache[assertion.namespace] = null;
          target[assertion.namespace]('mockRegion');
          expect(assertion.mocks.func).toHaveBeenCalled();
        });
        test('does not call describe function if recent cached data', () => {
          mockCache[assertion.namespace] = { timestamp: Date.now(), data: { mock: 'data'} };
          target[assertion.namespace]('mockRegion');
          expect(assertion.mocks.func).not.toHaveBeenCalled();
        });
        test('calls describe function if recent cached data', () => {
          mockCache[assertion.namespace] = { timestamp: Date.now(), data: { mock: 'data'} };
          target[assertion.namespace]('mockRegion');
          expect(assertion.mocks.func).not.toHaveBeenCalled();
        });
      });
      describe('return', () => {
        test('is a Promise', () => {
          expect(target[assertion.namespace]('mockRegion')).toBeInstanceOf(Promise);
        });
        test('promise rejects if describe function error', () => {
          mockDescribeFails[assertion.namespace] = true;
          mockCache[assertion.namespace] = null;
          target[assertion.namespace]('mockRegion').catch((err) => {
            expect(err).toBeInstanceOf(Error);
          });
        });
        test('promise resolves if describe function ok', () => {
          mockDescribeFails[assertion.namespace] = false;
          mockCache[assertion.namespace] = null;
          target[assertion.namespace]('mockRegion').then((response) => {  // meh, just stringify cos array of deep compare...
            expect(JSON.stringify(response)).toBe(JSON.stringify(assertion.resolve));
          });
        });

      });

    });
  });

});
