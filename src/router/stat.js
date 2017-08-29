const router = require('express').Router(),
  regions = require('../data/regions'),
  namespaces = require('../data/namespaces'),
  statistics = require('../data/statistics'),
  periods = require('../data/periods'),
  isValue = require('../util/isValue'),
  getDimensions = require('../util/getDimensions'),
  cloudwatch = require('../aws/cloudwatch');

router.route('/:namespace').get((req, res) => {
  res.status(404).send('no metric!');
});

router.route('/:namespace/:metric').get((req, res) => {
  if(!isValue(req.params.namespace, namespaces)) { return res.status(404).send(`the namespace "${req.params.namespace}" is invalid!`); }

  let region = 'eu-west-2';   // TODO bit of repetition here... refactor to function?
  if(req.query.region) {
    if(isValue(req.query.region, regions)) {
      region = req.query.region;
    } else {
      return res.status(404).send(`the region "${req.query.region}" is invalid`);
    }
  }

  let stat = 'Average';
  if(req.query.stat) {
    if(isValue(req.query.stat, statistics)) {
      stat = req.query.stat;
    } else {
      return res.status(404).send(`the stat "${req.query.stat}" is invalid`);
    }
  }

  let period = 300;
  if(req.query.period) {  // TODO DRY!
    req.query.period = parseInt(req.query.period);
    if(isValue(req.query.period, periods)) {
      period = req.query.period;
    } else {
      return res.status(404).send(`the period "${req.query.period}" is invalid`);
    }
  }

  req.params.namespace = req.params.namespace.toUpperCase();
  getDimensions(req.params.namespace, region, req.query.regex || null).then((dimensions) => {
    const options = {
      namespace: `AWS/${req.params.namespace}`,
      metric: req.params.metric,
      start: new Date(Date.now() - ((req.query.age) ? parseInt(req.query.age) : 3600000)),
      dimensions: dimensions,
      region: region,
      stat: [stat],
      regex: req.query.regex || null,
      period: period
    };
    cloudwatch.get(options)
      .then(response => res.json({
        options: options,
        response: response
      })).catch(error => res.status(500).json(error));
  }).catch(error => res.status(500).json(error));
});

module.exports = router;
