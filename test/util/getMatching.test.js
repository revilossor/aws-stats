describe('getMatching', () => {

  const namespaces = require('../../src/data/namespaces');

  const mockDescriptions = {
    EC2: [{ InstanceName: 'MockMatching'}, { InstanceName: 'MockNotMatching'}],
    ELB: [{ LoadBalancerName: 'MockMatching'}, { LoadBalancerName: 'MockNotMatching'}]
  };

  jest.mock('../../src/aws/describe', () => {
    const obj = {};
    Object.keys(mockDescriptions).forEach((key) => {
      obj[key] = () => {
        return new Promise((resolve) => {
          resolve(mockDescriptions[key]);
        });
      };
    });
    return obj;
  });

  let target, namespace, promise, result;
  beforeAll(() => {
    target = require('../../src/util/getMatching');
  });

  Object.keys(namespaces).forEach((key) => {
    namespace = namespaces[key];
    test(`has a "${namespace}" function`, () => {
      expect(target[namespace]).toBeDefined();
      expect(target[namespace]).toBeInstanceOf(Function);
    });
    describe('return', () => {
      beforeAll((done) => {
        promise = target[namespace]('MockMatching', 'MockRegion').then((res) => {
          result = res;
          done();
        });
      });
      test('returns a promise', () => {
        expect(promise).toBeInstanceOf(Promise);
      });
      test('resolves with regex matches', () => {
        expect(result).toEqual(expect.arrayContaining([mockDescriptions[namespace][0]]));
      });
    });

  });

});
