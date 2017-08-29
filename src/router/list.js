const router = require('express').Router(),
  cloudwatch = require('../aws/cloudwatch'),
  regions = require('../data/regions'),
  namespaces = require('../data/namespaces'),
  isValue = require('../util/isValue');

/*
  lists all available regions and namespaces
*/
router.route('/').get((req, res) => {
  res.json({
    regions: regions,
    namespaces: namespaces,
    statistics: require('../data/statistics'),
    periods: require('../data/periods')
  });
});

/*
  lists all available metrics for the given namespace, in the given region ( or default region - eu-west-2 )
*/
router.route('/:namespace').get((req, res) => {
  if(!isValue(req.params.namespace, namespaces)) {
    return res.status(404).send(`the namespace ${req.params.namespace} is invalid!`);
  }
  req.query.region = (isValue(req.query.region, regions)) ? req.query.region : 'eu-west-2';
  cloudwatch.list(`AWS/${req.params.namespace.toUpperCase()}`, req.query.region)    // TODO do these have to be uppered?
    .then(response => res.json(response.Metrics))
    .catch(error => res.status(500).json(error));
});

module.exports = router;
