const router = require('express').Router();

router.use('/list', require('./src/router/list'));

module.exports = router;
