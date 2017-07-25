const router = require('express').Router(),
  regions = require('../data/regions'),
  namespaces = require('../data/namespaces'),
  isValue = require('../util/isValue'),
  getDimensions = require('../util/getDimensions'),
  cloudwatch = require('../aws/cloudwatch');

router.route('/:namespace').get((req, res) => {
  res.status(403).send('no metric!');
});

router.route('/:namespace/:metric').get((req, res) => {
  if(!isValue(req.params.namespace, namespaces)) { return res.status(404).send(`the namespace "${req.params.namespace}" is invalid!`); }
  let region = 'eu-west-2';
  if(req.query.region) {
    if(isValue(req.query.region, regions)) {
      region = req.query.region;
    } else {
      return res.status(403).send(`the region "${req.query.region}" is invalid`);
    }
  }
  req.params.namespace = req.params.namespace.toUpperCase();
  getDimensions(req.params.namespace, region, req.query.regex || null).then((dimensions) => {
    const options = {
      namespace: req.params.namespace,
      metric: req.params.metric,
      start: new Date(Date.now() - ((req.query.age) ? parseInt(req.query.age) : 3600000)),
      dimensions: dimensions,
      region: region
    };
    // TODO get stats from cloudwatch module then return json. mutate somehow?
    cloudwatch.get(options)
      .then(response => res.json(response))
      .catch(error => res.status(500).json(error));
  }).catch(error => res.status(500).json(error));
});

module.exports = router;
