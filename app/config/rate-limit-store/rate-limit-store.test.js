/**
 * @module app/config/rate-limit-store.test
 * @description Focused lifecycle tests for shared rate-limit storage.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { createRateLimitStoreManager } = require("./rate-limit-store.js");

describe("rate-limit store manager", () => {
  it("destroys a stuck Redis connection after a bounded startup-cleanup wait", async () => {
    let destroyed = false;
    const client = {
      isOpen: true,
      on() {},
      async connect() {},
      async ping() {
        throw new Error("readiness rejected");
      },
      close: () => new Promise(() => {}),
      destroy() {
        destroyed = true;
        this.isOpen = false;
      },
    };
    await assert.rejects(
      createRateLimitStoreManager({
        mode: "redis",
        createRedisClient: () => client,
        commandTimeoutMs: 20,
      }),
      /readiness rejected/,
    );
    assert.equal(destroyed, true);
  });
  it("reports local-store readiness without opening infrastructure", async () => {
    const manager = await createRateLimitStoreManager();
    assert.equal(typeof manager.isReady, "function");
    assert.equal(await manager.isReady(), true);
  });
  it("connects one Redis client and creates independently namespaced stores", async () => {
    const calls = [];
    const client = {
      isOpen: false,
      on(eventName) {
        calls.push(["on", eventName]);
        return this;
      },
      async connect() {
        calls.push(["connect"]);
        this.isOpen = true;
      },
      async ping() {
        calls.push(["ping"]);
        return "PONG";
      },
      async sendCommand(command) {
        calls.push(["sendCommand", command]);
        return 1;
      },
      async close() {
        calls.push(["close"]);
        this.isOpen = false;
      },
    };

    const manager = await createRateLimitStoreManager({
      createRedisClient(options) {
        calls.push(["createClient", options]);
        return client;
      },
      mode: "redis",
      prefix: "example-production",
      redisUrl: "rediss://cache.example:6380",
    });

    const apiStore = manager.createStore("api");
    const authStore = manager.createStore("auth");

    assert.equal(manager.kind, "redis");
    assert.equal(apiStore.prefix, "example-production:api:");
    assert.equal(authStore.prefix, "example-production:auth:");
    assert.equal(calls[0][1].url, "rediss://cache.example:6380");
    assert.equal(calls[0][1].disableOfflineQueue, true);
    assert.equal(calls[0][1].socket.connectTimeout, 5000);
    assert.deepEqual(calls.slice(1, 4), [
      ["on", "error"],
      ["connect"],
      ["ping"],
    ]);

    await manager.close();
    assert.deepEqual(calls.at(-1), ["close"]);
  });

  it("rejects unsupported backing-store modes", async () => {
    await assert.rejects(
      () => createRateLimitStoreManager({ mode: "distributed-memory" }),
      /Rate-limit store mode must be memory or redis/,
    );
  });

  it("closes an opened Redis client when its readiness check fails", async () => {
    let closed = false;
    const client = {
      isOpen: false,
      on() {
        return this;
      },
      async connect() {
        this.isOpen = true;
      },
      async ping() {
        throw new Error("Redis is unavailable");
      },
      async close() {
        closed = true;
        this.isOpen = false;
      },
    };

    await assert.rejects(
      () =>
        createRateLimitStoreManager({
          createRedisClient: () => client,
          mode: "redis",
          redisUrl: "redis://cache.example:6379",
        }),
      /Redis is unavailable/,
    );
    assert.equal(closed, true);
  });
});
