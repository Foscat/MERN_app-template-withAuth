/**
 * @module server.test
 * @description Focused lifecycle tests for HTTP and infrastructure shutdown.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
  closeServer,
  initializeInfrastructure,
  reportStartupFailure,
} = require("./server.js");

describe("server lifecycle", () => {
  it("bounds partial-startup cleanup and preserves the original failure", async () => {
    let databaseClosed = false;
    const started = Date.now();
    await assert.rejects(
      initializeInfrastructure(
        { shutdownTimeoutMs: 20 },
        {
          createRateLimitStoreManager: async () => ({
            close: () => new Promise(() => {}),
          }),
          database: {
            set() {},
            async connect() {
              throw new Error("database startup rejected");
            },
            async disconnect() {
              databaseClosed = true;
            },
          },
        },
      ),
      /database startup rejected/,
    );
    assert.equal(databaseClosed, true);
    assert.ok(Date.now() - started < 1000);
  });
  it("forces a stuck listener closed while still releasing every resource", async () => {
    const lifecycle = { draining: false };
    const calls = [];
    await closeServer(
      {
        close() {},
        closeAllConnections() {
          calls.push("force");
        },
      },
      {
        lifecycle,
        shutdownTimeoutMs: 20,
        rateLimitStoreManager: {
          async close() {
            calls.push("redis");
          },
        },
        database: {
          async disconnect() {
            calls.push("mongo");
          },
        },
      },
    );
    assert.equal(lifecycle.draining, true);
    assert.deepEqual(calls, ["force", "redis", "mongo"]);
  });
  it("writes the fatal startup cause and environment setup guidance", () => {
    const writes = [];
    const output = {
      write(message) {
        writes.push(message);
      },
    };

    reportStartupFailure(new Error("JWT_ACCESS_SECRET is required"), output);

    assert.deepEqual(writes, [
      "Server startup failed: JWT_ACCESS_SECRET is required\n" +
        "Create .env from .env.example and configure its required values.\n",
    ]);
  });

  it("closes HTTP, shared rate-limit storage, and MongoDB in order", async () => {
    const calls = [];
    const httpServer = {
      close(callback) {
        calls.push("http");
        callback();
      },
    };
    const rateLimitStoreManager = {
      async close() {
        calls.push("rate-limit-store");
      },
    };
    const database = {
      async disconnect() {
        calls.push("mongodb");
      },
    };

    await closeServer(httpServer, { database, rateLimitStoreManager });

    assert.deepEqual(calls, ["http", "rate-limit-store", "mongodb"]);
  });

  it("initializes the selected limiter store before connecting MongoDB", async () => {
    assert.equal(typeof initializeInfrastructure, "function");
    const calls = [];
    const rateLimitStoreManager = {
      async close() {},
      createStore() {},
    };
    const database = {
      async connect(uri) {
        calls.push(["mongodb", uri]);
      },
      set(name, value) {
        calls.push(["mongoose-setting", name, value]);
      },
    };
    const config = {
      mongodbUri: "mongodb://localhost/example",
      rateLimitRedisPrefix: "example-production",
      rateLimitRedisUrl: "rediss://cache.example:6380",
      rateLimitStore: "redis",
    };

    const resources = await initializeInfrastructure(config, {
      async createRateLimitStoreManager(options) {
        calls.push(["rate-limit-store", options]);
        return rateLimitStoreManager;
      },
      database,
    });

    assert.equal(resources.database, database);
    assert.equal(resources.rateLimitStoreManager, rateLimitStoreManager);
    assert.deepEqual(calls, [
      [
        "rate-limit-store",
        {
          mode: "redis",
          prefix: "example-production",
          redisUrl: "rediss://cache.example:6380",
          connectTimeoutMs: undefined,
          commandTimeoutMs: undefined,
        },
      ],
      ["mongoose-setting", "sanitizeFilter", true],
      ["mongoose-setting", "strictQuery", true],
      ["mongoose-setting", "bufferCommands", false],
      ["mongoose-setting", "maxTimeMS", 5000],
      ["mongodb", "mongodb://localhost/example"],
    ]);
  });
});
