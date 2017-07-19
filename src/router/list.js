const router = require('express').Router(),
  cloudwatch = require('../aws/cloudwatch'),
  regions = require('../data/regions'),
  namespaces = require('../data/namespaces'),
  isValue = require('../util/isValue');

/*
  lists all available namespaces
*/
router.route('/').get((req, res) => {     // TODO this should be struct with namespaces / regions. also data endpoint for each?
  res.json({
    regions: regions,
    namespaces: namespaces
  });
});

/*
  lists all available metrics for the given namespace, in the given region ( or default region - eu-west-2 )
*/
router.route('/:namespace').get((req, res) => {
  if(!isValue(req.params.namespace, namespaces)) {
    return res.status(404).send(`the namespace ${req.params.namespace} is invalid! ( see /list for valid namespaces! )`);
  }
  req.query.region = (isValue(req.query.region, regions)) ? req.query.region : 'eu-west-2';
  cloudwatch.list(`AWS/${req.params.namespace.toUpperCase()}`, req.query.region)
    .then(response => res.json(response.Metrics))
    .catch(error => res.status(500).json(error));
});

module.exports = router;
