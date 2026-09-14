/**
 * @module app/controllers
 * @description Named controller and password-service exports for backend consumers.
 */
const hash = require("./hash/hash.js");
const userController = require("./users/users.js");

module.exports = { hash, userController };
