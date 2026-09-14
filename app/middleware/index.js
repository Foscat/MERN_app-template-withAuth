/**
 * @module app/middleware
 * @description Named public exports for this backend module group. Internal siblings import directly to avoid barrel cycles.
 */
const {
  requireAuth,
  requireRole,
  requireSelfOrRole,
} = require("./auth/auth.js");

module.exports = { requireAuth, requireRole, requireSelfOrRole };
