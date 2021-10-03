const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const { getRoutes } = require('./router');
app.use(getRoutes());

module.exports = app;