const router = require('express').Router(),
  cloudwatch = require('../aws/cloudwatch'),
  regions = require('../data/regions'),
  namespaces = require('../data/namespaces');

/*
  lists all available namespaces
*/
router.route('/').get((req, res) => {
  res.json(namespaces);
});

/*
  checks if string arg is a value in data json
*/
function isValid(arg, data) {
  if(!arg) { return false; }
  for(let datum in data) {
    if(data[datum].toUpperCase() === arg.toUpperCase()) { return true; }
  }
  return false;
}

/*
  lists all available metrics for the given namespace, in the given region ( or default region - eu-west-2 )
*/
router.route('/:namespace').get((req, res) => {
  if(!isValid(req.params.namespace, namespaces)) {
    return res.status(404).send(`the namespace ${req.params.namespace} is invalid! ( see /list for valid namespaces! )`);
  }
  req.query.region = (isValid(req.query.region, regions)) ? req.query.region : 'eu-west-2';
  cloudwatch.list(`AWS/${req.params.namespace.toUpperCase()}`, req.query.region)
    .then(response => res.json(response.Metrics))
    .catch(error => res.status(500).json(error));
});

module.exports = router;
