/**
 * @module app/models
 * @description Model registry for database collections.
 */

const User = require("./users/users.js");

const Session = require("./sessions/sessions.js");
module.exports = { User, Session };
