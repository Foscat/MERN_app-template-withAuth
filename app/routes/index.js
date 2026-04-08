/**
 * @module app/routes
 * @description Root router that mounts all API route groups.
 */

const router = require("express").Router();
const apiRoutes = require("./api");

router.use("/api", apiRoutes);

module.exports = router;
