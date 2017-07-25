/*
  returns a valid dimension object for cloudwatch calls
   - this will specify all the instances determined by the regex
*/

const getMatching = require('./getMatching');

const namespaceMap = {
  EC2:  {  name: 'InstanceId',        value: 'InstanceId'     },
  ELB:  {  name: 'LoadBalancerName',  value: 'LoadBalancerName' }
};

module.exports = (namespace, region, regex) => {
  return new Promise((resolve, reject) => {
    getMatching[namespace](region, regex).then((matching) => {
      resolve(matching.map(match => ({
        Name: namespaceMap[namespace].name,
        Value: match[namespaceMap[namespace].value]
      })));
    }).catch(reject);
  });
};
