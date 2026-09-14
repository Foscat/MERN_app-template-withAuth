/**
 * @module server
 * @description Testable HTTP bootstrap with validated configuration and graceful shutdown.
 */

require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const { createApp } = require("../create-app/create-app.js");
const {
  createRateLimitStoreManager,
  loadRuntimeConfig,
} = require("../config/index.js");

/**
 * Write an actionable fatal startup diagnostic without exposing stack traces or
 * runtime configuration values.
 *
 * @param {unknown} error - Rejected startup value.
 * @param {{write: Function}} [output] - Writable diagnostic stream.
 * @returns {void}
 */
function reportStartupFailure(error, output = process.stderr) {
  const message = (
    error instanceof Error ? error.message : String(error)
  ).replace(
    /\b(?:mongodb(?:\+srv)?|redis|rediss|https?):\/\/\S+/giu,
    "[redacted endpoint]",
  );
  output.write(
    `Server startup failed: ${message}\n` +
      "Create .env from .env.example and configure its required values.\n",
  );
}

/**
 * Close the HTTP listener and database connection during process shutdown.
 *
 * @param {Object} httpServer - Active HTTP listener.
 * @param {Object} [resources] - Infrastructure resources owned by the server.
 * @param {Object} [resources.database] - Database client to disconnect.
 * @param {Object} [resources.rateLimitStoreManager] - Shared limiter store manager.
 * @param {Object} [resources.lifecycle] - Shared readiness and draining state.
 * @param {number} [resources.shutdownTimeoutMs=15000] - Total graceful shutdown budget in milliseconds.
 * @returns {Promise<void>}
 */
async function closeServer(
  httpServer,
  {
    database = mongoose,
    rateLimitStoreManager,
    lifecycle = {},
    shutdownTimeoutMs = 15000,
  } = {},
) {
  lifecycle.draining = true;
  let timer;
  const deadline = Date.now() + shutdownTimeoutMs;
  try {
    await Promise.race([
      new Promise((resolve) => httpServer.close(() => resolve())),
      new Promise((resolve) => {
        timer = setTimeout(() => {
          httpServer.closeAllConnections?.();
          resolve();
        }, shutdownTimeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    const cleanup = Promise.allSettled([
      Promise.resolve().then(() => rateLimitStoreManager?.close()),
      Promise.resolve().then(() => database.disconnect()),
    ]);
    let cleanupTimer;
    try {
      const results = await Promise.race([
        cleanup,
        new Promise((resolve) => {
          cleanupTimer = setTimeout(
            () => resolve(null),
            Math.max(100, deadline - Date.now()),
          );
        }),
      ]);
      if (!results || results.some((result) => result.status === "rejected"))
        throw new Error("Infrastructure shutdown did not complete");
    } finally {
      clearTimeout(cleanupTimer);
    }
  }
}

/** Release partially initialized resources with the same bounded cleanup policy as shutdown.
 * @param {Object} resources Initialized dependencies and optional shutdown budget.
 * @returns {Promise<void>} Cleanup attempt; a redacted warning reports incomplete release.
 */
async function releaseStartupResources(resources) {
  try {
    await closeServer({ close: (done) => done() }, resources);
  } catch {
    process.stderr.write(
      JSON.stringify({ level: "error", event: "startup_cleanup_incomplete" }) +
        "\n",
    );
  }
}

/**
 * Register one-time operating-system signal handlers.
 *
 * @param {Object} httpServer - Active HTTP listener.
 * @param {Object} [resources] - Infrastructure resources owned by the server.
 * @returns {void}
 */
function registerShutdownHandlers(httpServer, resources) {
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
      await closeServer(httpServer, resources);
      process.exitCode = 0;
    } catch {
      // console.log("graceful shutdown return", { successful: false });
      process.stderr.write(
        JSON.stringify({
          level: "error",
          event: "shutdown_deadline_or_cleanup_failure",
        }) + "\n",
      );
      process.exit(1);
    }
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

/**
 * Connect shared rate-limit storage and MongoDB for the HTTP runtime.
 *
 * @param {ReturnType<loadRuntimeConfig>} config - Validated runtime settings.
 * @param {Object} [dependencies] - Infrastructure dependency overrides.
 * @param {Function} [dependencies.createRateLimitStoreManager] - Limiter manager factory.
 * @param {Object} [dependencies.database] - Mongoose-compatible database client.
 * @returns {Promise<{database: Object, rateLimitStoreManager: Object}>} Connected resources.
 */
async function initializeInfrastructure(
  config,
  {
    createRateLimitStoreManager:
      createStoreManager = createRateLimitStoreManager,
    database = mongoose,
  } = {},
) {
  // console.log("initializeInfrastructure function called", { rateLimitStore: config.rateLimitStore });
  const rateLimitStoreManager = await createStoreManager({
    mode: config.rateLimitStore,
    prefix: config.rateLimitRedisPrefix,
    redisUrl: config.rateLimitRedisUrl,
    connectTimeoutMs: config.dependencyTimeoutMs,
    commandTimeoutMs: config.redisCommandTimeoutMs,
  });

  try {
    database.set("sanitizeFilter", true);
    database.set("strictQuery", true);
    // console.log("MongoDB connect API called", { configured: Boolean(config.mongodbUri) });
    database.set("bufferCommands", false);
    database.set("maxTimeMS", config.queryTimeoutMs || 5000);
    await database.connect(config.mongodbUri, {
      maxPoolSize: config.mongoMaxPoolSize || 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: config.dependencyTimeoutMs || 5000,
      waitQueueTimeoutMS: config.dependencyTimeoutMs || 5000,
      socketTimeoutMS:
        (config.dependencyTimeoutMs || 5000) + (config.queryTimeoutMs || 5000),
      autoIndex: config.nodeEnv !== "production",
    });
    // console.log("MongoDB connect API return", { connected: true });
  } catch (error) {
    await releaseStartupResources({
      rateLimitStoreManager,
      database,
      shutdownTimeoutMs: config.shutdownTimeoutMs,
    });
    throw error;
  }

  // console.log("initializeInfrastructure function return", { rateLimitStore: rateLimitStoreManager.kind });
  return { database, rateLimitStoreManager };
}

/**
 * Connect to MongoDB, create the Express application, and open its listener.
 *
 * @param {ReturnType<loadRuntimeConfig>} [config] - Validated runtime settings.
 * @returns {Promise<Object>} Active HTTP listener.
 */
async function startServer(config = loadRuntimeConfig()) {
  // console.log("startServer function called", { port: config.port, nodeEnv: config.nodeEnv });
  const resources = await initializeInfrastructure(config);

  resources.lifecycle = { draining: false };
  resources.shutdownTimeoutMs = config.shutdownTimeoutMs;
  let httpServer;
  try {
    const app = createApp({
      config,
      lifecycle: resources.lifecycle,
      isReady: async () => {
        if (resources.database.connection.readyState !== 1) return false;
        const [databaseReady, storeReady] = await Promise.all([
          resources.database.connection.db
            .admin()
            .command({ ping: 1 }, { maxTimeMS: config.queryTimeoutMs })
            .then(() => true),
          resources.rateLimitStoreManager.isReady(),
        ]);
        return databaseReady && storeReady;
      },
      bodyLimit: config.bodyLimit,
      clientOrigins: config.clientOrigins,
      enableRateLimit: config.nodeEnv !== "test",
      isProduction: config.nodeEnv === "production",
      rateLimitStoreFactory: (namespace) =>
        resources.rateLimitStoreManager.createStore(namespace),
      trustProxy: config.trustProxy,
    });
    httpServer = await new Promise((resolve, reject) => {
      const listener = app.listen(config.port, () => resolve(listener));
      listener.once("error", reject);
    });
  } catch (error) {
    await releaseStartupResources(resources);
    throw error;
  }

  httpServer.requestTimeout = config.requestTimeoutMs;
  httpServer.headersTimeout = Math.min(
    config.headersTimeoutMs,
    config.requestTimeoutMs,
  );
  httpServer.keepAliveTimeout = 5000;
  registerShutdownHandlers(httpServer, resources);
  // console.log("HTTP listener ready", { port: config.port });
  // console.log("startServer function return", { listening: httpServer.listening });
  return httpServer;
}

if (require.main === module) {
  startServer().catch((error) => {
    // console.log("server startup return", { successful: false });
    reportStartupFailure(error);
    process.exit(1);
  });
}

module.exports = {
  closeServer,
  initializeInfrastructure,
  registerShutdownHandlers,
  reportStartupFailure,
  startServer,
};
