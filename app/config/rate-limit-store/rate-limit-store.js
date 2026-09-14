/**
 * @module app/config/rate-limit-store
 * @description Lifecycle-managed Redis/Valkey stores for distributed request quotas.
 */

const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");

/**
 * Lifecycle wrapper for rate-limit stores.
 *
 * @typedef {Object} RateLimitStoreManager
 * @property {function(): Promise<void>} close - Close shared connections.
 * @property {function(string): (Object|undefined)} createStore - Create one namespaced limiter store.
 * @property {string} kind - Selected backing-store mode.
 * @property {function(): Promise<boolean>} isReady - Probe the backing store within the command budget.
 */

/**
 * Create a collision-resistant key prefix for one limiter.
 *
 * @param {string} prefix - Application and environment identifier.
 * @param {string} namespace - Individual limiter identifier.
 * @returns {string} Redis key prefix ending with a delimiter.
 */
function createStorePrefix(prefix, namespace) {
  return `${prefix.replace(/:+$/u, "")}:${namespace}:`;
}

/**
 * Create and connect the store manager used by every application limiter.
 *
 * Memory mode delegates to express-rate-limit's local default. Redis mode
 * opens one connection and creates a distinct RedisStore per limiter because
 * each store owns limiter-specific window configuration.
 *
 * @param {Object} [options] - Store manager configuration.
 * @param {function(Object): Object} [options.createRedisClient] - Redis client factory override.
 * @param {"memory"|"redis"} [options.mode] - Backing store selection.
 * @param {string} [options.prefix] - Application and environment key prefix.
 * @param {string} [options.redisUrl] - Redis or TLS-enabled Redis connection URL.
 * @param {number} [options.connectTimeoutMs=5000] - Connection attempt budget in milliseconds.
 * @param {number} [options.commandTimeoutMs=2000] - Per-command budget in milliseconds.
 * @returns {Promise<RateLimitStoreManager>} Connected store manager.
 */
async function createRateLimitStoreManager({
  createRedisClient = createClient,
  mode = "memory",
  prefix = "mern-app-template-development-rate-limit",
  redisUrl,
  connectTimeoutMs = 5000,
  commandTimeoutMs = 2000,
} = {}) {
  // console.log("createRateLimitStoreManager function called", { mode, redisConfigured: Boolean(redisUrl) });
  if (mode !== "memory" && mode !== "redis") {
    throw new Error("Rate-limit store mode must be memory or redis");
  }
  if (mode !== "redis") {
    return {
      async isReady() {
        return true;
      },
      async close() {},
      createStore() {
        return undefined;
      },
      kind: "memory",
    };
  }

  const client = createRedisClient({
    url: redisUrl,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: connectTimeoutMs,
      reconnectStrategy: (retries) =>
        retries < 3 ? Math.min(100 * 2 ** retries, 1000) : false,
    },
    commandOptions: { timeout: commandTimeoutMs },
  });
  client.on("error", (error) => {
    void error;
    process.stderr.write(
      JSON.stringify({ level: "error", event: "redis_unavailable" }) + "\n",
    );
    // console.log("Redis rate-limit client error", { message: error.message });
  });

  /** Drain queued commands briefly, then forcibly release the Redis socket if necessary.
   * @returns {Promise<void>} Bounded connection cleanup.
   */
  async function closeClient() {
    if (!client.isOpen) return;
    let timer;
    try {
      await Promise.race([
        Promise.resolve().then(() => client.close()),
        new Promise((resolve) => {
          timer = setTimeout(resolve, commandTimeoutMs);
        }),
      ]);
    } finally {
      clearTimeout(timer);
      if (client.isOpen) client.destroy();
    }
  }

  try {
    // console.log("Redis rate-limit connect API called", { configured: true });
    await client.connect();
    // console.log("Redis rate-limit ping API called");
    await client.ping();
    // console.log("Redis rate-limit ping API return", { ready: client.isReady });
  } catch (error) {
    if (client.isOpen) {
      // console.log("Redis rate-limit startup cleanup called");
      await closeClient();
      // console.log("Redis rate-limit startup cleanup return", { closed: true });
    }
    throw error;
  }

  /**
   * Send one adapter command through the shared Redis connection.
   *
   * @param {...string} command - Redis command and arguments.
   * @returns {Promise<unknown>} Redis protocol reply.
   */
  async function sendCommand(...command) {
    // console.log("Redis rate-limit command API called", { command: command[0] });
    let result;
    try {
      result = await client.sendCommand(command, { timeout: commandTimeoutMs });
    } catch {
      throw Object.assign(
        new Error("Shared rate-limit storage is unavailable"),
        { statusCode: 503, code: "RATE_LIMIT_STORE_UNAVAILABLE" },
      );
    }
    // console.log("Redis rate-limit command API return", { command: command[0] });
    return result;
  }

  const manager = {
    async isReady() {
      if (!client.isReady) return false;
      try {
        return (
          (await client.sendCommand(["PING"], {
            timeout: commandTimeoutMs,
          })) === "PONG"
        );
      } catch {
        return false;
      }
    },
    async close() {
      if (!client.isOpen) {
        return;
      }
      // console.log("Redis rate-limit close API called");
      await closeClient();
      // console.log("Redis rate-limit close API return", { closed: true });
    },
    createStore(namespace) {
      return new RedisStore({
        prefix: createStorePrefix(prefix, namespace),
        sendCommand,
      });
    },
    kind: "redis",
  };

  // console.log("createRateLimitStoreManager function return", { kind: manager.kind });
  return manager;
}

module.exports = { createRateLimitStoreManager, createStorePrefix };
