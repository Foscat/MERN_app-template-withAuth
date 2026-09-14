/**
 * @module app/config
 * @description Named public exports for this backend module group. Internal siblings import directly to avoid barrel cycles.
 */
const {
  applyRuntimeConfig,
  loadRuntimeConfig,
  parseInteger,
  parseTrustProxy,
} = require("./runtime/runtime.js");
const {
  createRateLimitStoreManager,
  createStorePrefix,
} = require("./rate-limit-store/rate-limit-store.js");

module.exports = {
  applyRuntimeConfig,
  loadRuntimeConfig,
  parseInteger,
  parseTrustProxy,
  createRateLimitStoreManager,
  createStorePrefix,
};
