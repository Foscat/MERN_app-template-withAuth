/**
 * @module server
 * @description Testable HTTP bootstrap with validated configuration and graceful shutdown.
 */

require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const { createApp } = require("./app/create-app");
const { loadRuntimeConfig } = require("./app/config/runtime");

/**
 * Close the HTTP listener and database connection during process shutdown.
 *
 * @param {Object} httpServer - Active HTTP listener.
 * @returns {Promise<void>}
 */
async function closeServer(httpServer) {
  await new Promise((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  await mongoose.disconnect();
}

/**
 * Register one-time operating-system signal handlers.
 *
 * @param {Object} httpServer - Active HTTP listener.
 * @returns {void}
 */
function registerShutdownHandlers(httpServer) {
  let shuttingDown = false;

  /**
   * Perform an idempotent graceful shutdown.
   *
   * @param {NodeJS.Signals} signal - Signal that initiated shutdown.
   * @returns {Promise<void>}
   */
  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }
    void signal;
    shuttingDown = true;
    // console.log("shutdown signal received", { signal });

    try {
      await closeServer(httpServer);
      process.exitCode = 0;
    } catch {
      // console.log("graceful shutdown return", { successful: false });
      process.exitCode = 1;
    }
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

/**
 * Connect to MongoDB, create the Express application, and open its listener.
 *
 * @param {ReturnType<loadRuntimeConfig>} [config] - Validated runtime settings.
 * @returns {Promise<Object>} Active HTTP listener.
 */
async function startServer(config = loadRuntimeConfig()) {
  // console.log("startServer function called", { port: config.port, nodeEnv: config.nodeEnv });
  mongoose.set("sanitizeFilter", true);
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongodbUri);

  const app = createApp({
    bodyLimit: config.bodyLimit,
    clientOrigins: config.clientOrigins,
    isProduction: config.nodeEnv === "production",
    trustProxy: config.trustProxy,
  });
  const httpServer = await new Promise((resolve, reject) => {
    const listener = app.listen(config.port, () => resolve(listener));
    listener.once("error", reject);
  });

  registerShutdownHandlers(httpServer);
  // console.log("HTTP listener ready", { port: config.port });
  // console.log("startServer function return", { listening: httpServer.listening });
  return httpServer;
}

if (require.main === module) {
  startServer().catch(() => {
    // console.log("server startup return", { successful: false });
    process.exitCode = 1;
  });
}

module.exports = { closeServer, registerShutdownHandlers, startServer };
