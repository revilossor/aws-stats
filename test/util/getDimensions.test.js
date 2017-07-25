describe('getDimensions', () => {

  let mockMatches = [{ InstanceName: 'mockValue'}];
  let mockGetMatchesResolves = true;

  function mockGetMatchingNamespaceFactory() {
    return jest.fn().mockImplementation(() => new Promise((resolve, reject) => {
      (mockGetMatchesResolves) ? resolve(mockMatches) : reject(new Error('mockError'));
    }));
  }

  const mockGetMatching = {
    EC2: mockGetMatchingNamespaceFactory(),
    ELB: mockGetMatchingNamespaceFactory()
  };

  jest.mock('../../src/util/getMatching', () => mockGetMatching);

  const assertions = [
    { namespace: 'EC2', matches: { InstanceId: 'mockValue'}, dimension: 'InstanceId' },
    { namespace: 'ELB', matches: { LoadBalancerName: 'mockValue'}, dimension: 'LoadBalancerName' }
  ];

  let target, result;

  beforeAll(() => {
    target = require('../../src/util/getDimensions');
  });

  describe('all namespaces', () => {

    test('exports a function', () => {
      expect(target).toBeInstanceOf(Function);
    });

    test('gets regex matches for namespace in region', () => {
      target('EC2', 'mockRegion', 'mockRegex');
      expect(mockGetMatching.EC2).toHaveBeenCalledWith('mockRegion', 'mockRegex');
    });

    test('returns a promise', () => {
      expect(target('EC2', 'mockRegion', 'mockRegex')).toBeInstanceOf(Promise);
    });

  });

  assertions.forEach((assertion) => {
    describe(`namespace "${assertion.namespace}"`, () => {
      beforeAll((done) => {
        mockMatches = [assertion.matches];
        target(assertion.namespace, 'mockRegion', 'mockRegex').then((res) => {
          result = res;
          done();
        });
      });
      test('mutates matched resources into dimension struct', () => {
        expect(result).toEqual([{
          Name: assertion.dimension,
          Value: 'mockValue'
        }]);
      });
    });
  });

});
