/**
 * @module app/routes/api-router
 * @description API router that mounts resource-specific endpoints.
 */

const express = require("express");
const { createUsersRouter } = require("../users-router/users-router.js");

/**
 * Create the API router and propagate shared infrastructure to resource routes.
 *
 * @param {Object} [options] - API router configuration.
 * @param {Object} [options.authRateLimitStore] - Shared authentication quota store.
 * @param {boolean} [options.enableRateLimit] - Whether route quotas are enforced.
 * @returns {Object} Configured Express API router.
 */
function createApiRouter(options = {}) {
  const router = express.Router();
  router.use("/users", createUsersRouter(options));
  return router;
}

module.exports = { createApiRouter };
