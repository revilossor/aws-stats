/*
  describes instances of particular resources in region
    caches responses, to keep API requests to a minimum.
*/
const AWS = require('aws-sdk'),
  cache = require('../data/cache');

const maxCacheAge = 600000;   // 10 mins

/*
  gets item named namespace from cache
    if the data ISNT older than maxAge, return it
    if the data IS older than maxAge, execute the getFunction the get new data, and store it with a new timestamp.
*/
function tryCacheGet(namespace, maxAge, region, getFunction) {
  return new Promise((resolve, reject) => {
    const existing = cache[namespace];
    if(!existing || (Date.now() - existing.timestamp) > maxAge) {
      getFunction.call(null, region).then((response) => {
        cache[namespace] = { timestamp: Date.now(), data: response };
        resolve(response);
      }).catch(reject);
    } else {
      resolve(existing.data);
    }
  });
}

module.exports = {
  ELB: (region) => {
    return tryCacheGet('ELB', maxCacheAge, region, (region) => {
      const elb = new AWS.ELB({ apiVersion: '2012-06-01', region: region });
      return new Promise((resolve, reject) => {
        elb.describeLoadBalancers({}, (err, data) => {
          (err) ? reject(err) : resolve(data.LoadBalancerDescriptions);
        });
      });
    });
  },
  EC2: (region) => {
    return tryCacheGet('EC2', maxCacheAge, region, (region) => {
      return new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: region });
        ec2.describeInstances({}, (err, data) => {    // return instances - with an InstanceName property ( assumes no reservations... )
          (err) ?
            reject(err) :
            resolve(
              data.Reservations.map((instance) => {
                instance = instance.Instances[0];
                instance.InstanceName = instance.Tags.filter(tag => tag.Key == 'Name')[0].Value;
                return instance;
              })
            );
        });
      });
    });
  }
};
