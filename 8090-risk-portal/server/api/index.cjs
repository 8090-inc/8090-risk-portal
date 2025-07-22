const express = require('express');
const router = express.Router();
const v1Api = require('./v1/index.cjs');

// Version routing
router.use('/v1', v1Api.router);

// Default to v1 for backward compatibility
router.use('/', v1Api.router);

// Export both router and initialization function
module.exports = {
  router,
  initializeServices: v1Api.initializeServices
};