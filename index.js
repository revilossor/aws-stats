const router = require('express').Router();

router.route('/test').get((req, res) => {
  res.send('helloworld');
});

module.exports = router;
