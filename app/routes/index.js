/**
 * @module app/routes
 * @description Named public exports for this backend module group. Internal siblings import directly to avoid barrel cycles.
 */
const { createRoutes } = require("./root-router/root-router.js");
const { createApiRouter } = require("./api-router/api-router.js");
const { createUsersRouter } = require("./users-router/users-router.js");

module.exports = { createRoutes, createApiRouter, createUsersRouter };
