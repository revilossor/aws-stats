/*
  this module gets all resources of the given type
  with names that match the passed regex from aws
*/
const describe = require('../aws/describe');

function describeAndFilter(namespace, region, regex, propToMatch) {
  return new Promise((resolve, reject) => {
    describe[namespace](region)
      .then((results) => resolve(results.filter(result => result[propToMatch].match(regex))))
      .catch(reject);
  });
}

module.exports = {
  EC2: (regex, region) => describeAndFilter('EC2', region, regex, 'InstanceName'),
  ELB: (regex, region) => describeAndFilter('ELB', region, regex, 'LoadBalancerName')
};
