const router = require('express').Router();

router.use('/list', require('./src/router/list'));
router.use('/stat', require('./src/router/stat'));

// TODO documentation on / ?

module.exports = router;
