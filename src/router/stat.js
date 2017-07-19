const router = require('express').Router();

router.route('/').get((req, res) => {
  res.send('poop');
});

module.exports = router;
