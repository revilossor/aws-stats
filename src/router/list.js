const router = require('express').Router(),
  cloudwatch = require('../aws/cloudwatch'),
  namespaces = require('../data/namespaces');

/*
  lists all available namespaces
*/
router.route('/').get((req, res) => {
  res.json(namespaces);
});

/*
  checks if arg is a valid namespace
*/
function isValidNamespace(str) {        // TODO some namespaces dont seem to be woking right - eg Route53
  for(let namespace in namespaces) {
    if(namespaces[namespace].toUpperCase() === str.toUpperCase()) { return true; }    // TODO lots of to upper here...
  }
  return false;
}

/*
  lists all available metrics for the given namespace
*/
router.route('/:namespace').get((req, res) => {
  if(isValidNamespace(req.params.namespace)) {
    cloudwatch.list(`AWS/${req.params.namespace.toUpperCase()}`)
      .then(response => res.json(response.Metrics))
      .catch(error => res.status(500).json(error));
  } else {
    res.status(404).send(`the namespace ${req.params.namespace} is invalid! ( see /list for valid namespaces! )`);
  }
});

module.exports = router;
