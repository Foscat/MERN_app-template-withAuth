/**
 * @module app/routes/root-router
 * @description Root router that mounts all API route groups.
 */

const express = require("express");
const { createApiRouter } = require("../api-router/api-router.js");

/**
 * Create the root router for all application endpoints.
 *
 * @param {Object} [options] - Route dependency configuration.
 * @returns {Object} Configured Express root router.
 */
function createRoutes(options = {}) {
  const router = express.Router();
  router.use("/api", createApiRouter(options));
  return router;
}

module.exports = { createRoutes };
