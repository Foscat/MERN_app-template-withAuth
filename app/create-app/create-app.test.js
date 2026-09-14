/**
 * @module app/create-app.test
 * @description Focused HTTP-boundary tests for the configured Express application.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { before, describe, it } = require("node:test");

process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "test-access-secret-with-at-least-thirty-two-bytes";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "test-refresh-secret-with-at-least-thirty-two-bytes";

const request = require("supertest");
const { createApp } = require("./create-app.js");

/**
 * Create isolated limiter store instances backed by one test counter map.
 *
 * @param {Map<string, number>} counters - Shared hit counters.
 * @returns {function(string): Object} Express-rate-limit store factory.
 */
function createSharedTestStoreFactory(counters) {
  return (namespace) => {
    let windowMs = 0;

    return {
      init(options) {
        windowMs = options.windowMs;
      },
      async increment(key) {
        const namespacedKey = `${namespace}:${key}`;
        const totalHits = (counters.get(namespacedKey) || 0) + 1;
        counters.set(namespacedKey, totalHits);
        return {
          totalHits,
          resetTime: new Date(Date.now() + windowMs),
        };
      },
      async decrement(key) {
        const namespacedKey = `${namespace}:${key}`;
        counters.set(
          namespacedKey,
          Math.max((counters.get(namespacedKey) || 1) - 1, 0),
        );
      },
      async resetKey(key) {
        counters.delete(`${namespace}:${key}`);
      },
    };
  };
}

/**
 * Create a temporary production client build fixture.
 *
 * @returns {{ root: string, cleanup: Function }} Fixture path and cleanup callback.
 */
function createClientDistFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mern-client-dist-"));
  fs.mkdirSync(path.join(root, "assets"), { recursive: true });
  fs.mkdirSync(path.join(root, "settings"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "routes-manifest.json"),
    JSON.stringify([{ path: "/settings", indexable: false }]),
  );
  fs.writeFileSync(
    path.join(root, "settings", "index.html"),
    "<!doctype html><title>Settings | MERN Forge</title>",
  );
  fs.writeFileSync(
    path.join(root, "404.html"),
    "<!doctype html><title>404</title>",
  );

  return {
    root,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

describe("Express application security boundary", () => {
  it("serves real page and missing-asset status codes from the route manifest", async () => {
    const fixture = createClientDistFixture();
    const production = createApp({
      clientDistPath: fixture.root,
      enableRateLimit: false,
      isProduction: true,
    });
    try {
      await request(production).get("/missing-page").expect(404);
      await request(production).get("/assets/missing.js").expect(404);
      const privatePage = await request(production)
        .get("/settings")
        .expect(200);
      assert.equal(privatePage.headers["x-robots-tag"], "noindex, follow");
      assert.match(privatePage.text, /Settings \| MERN Forge/);
    } finally {
      fixture.cleanup();
    }
  });
  it(
    "shares independent authentication sessions between HTTP instances",
    { skip: !process.env.TEST_MONGODB_URI },
    async () => {
      const mongoose = require("mongoose");
      const { loadRuntimeConfig } = require("../config/runtime/runtime.js");
      await mongoose.connect(process.env.TEST_MONGODB_URI);
      try {
        const config = loadRuntimeConfig({
          NODE_ENV: "test",
          BCRYPT_ROUNDS: "10",
        });
        const first = createApp({ config, enableRateLimit: false });
        const second = createApp({ config, enableRateLimit: false });
        const username = `http-${Date.now()}`;
        const registered = await request(first)
          .post("/api/users/register")
          .send({
            name: "HTTP User",
            username,
            email: `${username}@example.test`,
            password: "Http-test-passphrase-42!",
          })
          .expect(201);
        const token = registered.body.token;
        const listed = await request(second)
          .get("/api/users/sessions")
          .auth(token, { type: "bearer" })
          .expect(200);
        assert.equal(listed.body.sessions.length, 1);
        const refreshed = await request(second)
          .post("/api/users/refresh")
          .set("Cookie", registered.headers["set-cookie"])
          .expect(200);
        await request(first)
          .post("/api/users/logout-all")
          .auth(refreshed.body.token, { type: "bearer" })
          .expect(200);
        await request(second)
          .get("/api/users/current")
          .auth(token, { type: "bearer" })
          .expect(401);
        const { User, Session } = require("../models/index.js");
        await Session.deleteMany({ userId: registered.body.user.id });
        await User.deleteOne({ _id: registered.body.user.id });
      } finally {
        await mongoose.disconnect();
      }
    },
  );
  it("separates liveness from dependency readiness and draining", async () => {
    const lifecycle = { draining: false };
    let connected = false;
    const probeApp = createApp({
      enableRateLimit: false,
      lifecycle,
      isReady: async () => connected,
    });
    await request(probeApp).get("/api/health/live").expect(200);
    await request(probeApp).get("/api/health/ready").expect(503);
    connected = true;
    await request(probeApp).get("/api/health").expect(200);
    lifecycle.draining = true;
    const response = await request(probeApp)
      .get("/api/health/ready")
      .expect(503);
    assert.ok(response.headers["x-request-id"]);
    assert.equal(response.headers["cache-control"], "no-store");
  });
  let app;

  before(() => {
    app = createApp({
      bodyLimit: "1kb",
      clientOrigins: ["http://localhost:5173"],
      enableRateLimit: false,
      isProduction: false,
    });
  });

  it("sets defensive headers and serves a development health response", async () => {
    const response = await request(app).get("/").expect(200);

    assert.match(response.headers["content-security-policy"], /default-src/);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["x-powered-by"], undefined);
    assert.deepEqual(response.body, { status: "ok" });
  });

  it("rejects oversized JSON before route handling", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send({ value: "x".repeat(2048) })
      .expect(413);

    assert.equal(response.body.message, "Request body is too large");
  });

  it("protects user collection routes and returns JSON for unknown APIs", async () => {
    await request(app).get("/api/users").expect(401);

    const response = await request(app).get("/api/not-real").expect(404);
    assert.equal(response.body.message, "API route not found");
  });

  it("allows configured browser origins and rejects other origins", async () => {
    await request(app)
      .options("/api/users/login")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .expect(204)
      .expect("Access-Control-Allow-Origin", "http://localhost:5173");

    const response = await request(app)
      .options("/api/users/login")
      .set("Origin", "https://untrusted.example")
      .set("Access-Control-Request-Method", "POST")
      .expect(403);
    assert.equal(response.body.message, "Origin is not allowed");
  });

  it("enforces one API quota across application instances", async () => {
    const rateLimitStoreFactory = createSharedTestStoreFactory(new Map());
    const appOne = createApp({
      enableRateLimit: true,
      isProduction: false,
      rateLimitStoreFactory,
    });
    const appTwo = createApp({
      enableRateLimit: true,
      isProduction: false,
      rateLimitStoreFactory,
    });

    for (let index = 0; index < 150; index += 1) {
      await request(appOne).get("/api/not-real").expect(404);
      await request(appTwo).get("/api/not-real").expect(404);
    }

    const response = await request(appTwo).get("/api/not-real").expect(429);
    assert.equal(
      response.body.message,
      "Too many requests; please try again later",
    );
  });

  it("allocates independent namespaces for API and authentication quotas", () => {
    const namespaces = [];
    const sharedStoreFactory = createSharedTestStoreFactory(new Map());

    createApp({
      enableRateLimit: true,
      isProduction: false,
      rateLimitStoreFactory(namespace) {
        namespaces.push(namespace);
        return sharedStoreFactory(namespace);
      },
    });

    assert.deepEqual(namespaces, ["api", "auth"]);
  });
});
