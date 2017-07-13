const AWS = require('aws-sdk');

const cloudwatch = new AWS.CloudWatch({
  apiVersion: '2010-08-01',
  region: 'eu-west-2'
});

module.exports = {
  list: (namespace) => {
    return new Promise((resolve, reject) => {
      cloudwatch.listMetrics({
        Namespace: namespace
      }, (err, data) => {
        (err) ? reject(err) : resolve(data);
      });
    });
  }
};
