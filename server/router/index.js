const express = require('express');
const { getFileRouter } = require('./file');

module.exports.getRoutes = () => {
    const router = express.Router();
    router.use('/file', getFileRouter());
    return router;
}