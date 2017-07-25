const AWS = require('aws-sdk');
const apiVersion = '2010-08-01';

module.exports = {
  list: (namespace, region) => {
    return new Promise((resolve, reject) => {
      new AWS.CloudWatch({
        apiVersion: apiVersion,
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
      new AWS.CloudWatch({
        apiVersion: apiVersion,
        region: options.region
      }).getMetricStatistics({
        StartTime: options.start,
        EndTime: new Date(),
        MetricName: options.metric,
        Namespace: options.namespace,
        Period: 300,
        Statistics: ['Average'],
        Dimensions: options.dimensions
      }, (err, data) => {
        (err) ? reject(err) : resolve(data);
      });
    });
  }
};
