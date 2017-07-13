const app = require('express')();

app.use('/', require('../index'));

app.listen(3000);
