/** @module app/repositories
 * @description Explicit persistence factory exports.
 */
const { createUserRepository } = require("./users/users.js");
module.exports = { createUserRepository };
