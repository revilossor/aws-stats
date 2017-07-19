const AWS = require('aws-sdk');

module.exports = {
  list: (namespace, region) => {
    return new Promise((resolve, reject) => {
      new AWS.CloudWatch({
        apiVersion: '2010-08-01',
        region: region
      }).listMetrics({
        Namespace: namespace
      }, (err, data) => {
        (err) ? reject(err) : resolve(data);
      });
    });
  },
  get: (options) => {
    return new Promise((resolve, reject) => {
      resolve({not: 'implemented' + options});
      if(Math.random() == 0) { reject(); }
    });
  }
};
