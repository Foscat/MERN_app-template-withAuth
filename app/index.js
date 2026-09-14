/**
 * @module app
 * @description Named public exports for this backend module group. Internal siblings import directly to avoid barrel cycles.
 */
const {
  createApp,
  createOriginValidator,
  errorHandler,
  parseClientOrigins,
} = require("./create-app/create-app.js");
const {
  closeServer,
  initializeInfrastructure,
  registerShutdownHandlers,
  reportStartupFailure,
  startServer,
} = require("./server/server.js");

module.exports = {
  createApp,
  createOriginValidator,
  errorHandler,
  parseClientOrigins,
  closeServer,
  initializeInfrastructure,
  registerShutdownHandlers,
  reportStartupFailure,
  startServer,
};
