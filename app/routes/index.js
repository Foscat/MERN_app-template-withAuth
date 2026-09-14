/**
 * @module app/routes
 * @description Root router that mounts all API route groups.
 */

/** Express router for application endpoints. @type {Object} */
const router = require("express").Router();
const apiRoutes = require("./api");

router.use("/api", apiRoutes);

module.exports = router;
