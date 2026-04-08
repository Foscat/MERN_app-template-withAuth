/**
 * @module app/routes/api
 * @description API route index that mounts resource-specific routers.
 */

const router = require("express").Router();
const userRoutes = require("./users");

router.use("/users", userRoutes);

module.exports = router;
