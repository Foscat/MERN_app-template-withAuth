/**
 * @module app/routes/api
 * @description API route index that mounts resource-specific routers.
 */

/** Express router for versionless API resources. @type {Object} */
const router = require("express").Router();
const userRoutes = require("./users");

router.use("/users", userRoutes);

module.exports = router;
