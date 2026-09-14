/**
 * @module app/config/runtime.test
 * @description Focused tests for runtime environment validation and normalization.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { applyRuntimeConfig, loadRuntimeConfig } = require("./runtime.js");

describe("runtime configuration", () => {
  it("rejects explicitly empty values, invalid URL authorities, and overflowing lifetimes", () => {
    for (const environment of [
      { NODE_ENV: "" },
      { JWT_ACCESS_SECRET: "" },
      { MONGODB_URI: "mongodb:///database" },
      { RATE_LIMIT_REDIS_URL: "redis:///0" },
      { TRUST_PROXY: "" },
      { CLIENT_ORIGINS: "" },
      { DEPLOYMENT_MODE: "" },
      { ACCESS_TOKEN_EXPIRES_IN: "999999999999999999999999d" },
    ])
      assert.throws(() => loadRuntimeConfig(environment));
  });
  it("rejects ambiguous deployment settings and bounds resource budgets", () => {
    for (const environment of [
      { NODE_ENV: "prod" },
      { PORT: "3001junk" },
      { PORT: "70000" },
      { ACCESS_TOKEN_EXPIRES_IN: "forever" },
      { TRUST_PROXY: "1foo" },
      { CLIENT_ORIGINS: "https://example.com/path" },
      { MONGODB_URI: "https://example.com" },
      { DEPLOYMENT_MODE: "multi", RATE_LIMIT_STORE: "memory" },
    ])
      assert.throws(() => loadRuntimeConfig(environment));
    const config = loadRuntimeConfig({
      DEPLOYMENT_MODE: "multi",
      RATE_LIMIT_STORE: "redis",
    });
    assert.equal(config.deploymentMode, "multi");
    assert.equal(config.mongoMaxPoolSize, 10);
    assert.equal(config.shutdownTimeoutMs, 15000);
  });
  it("provides complete development defaults and applies authentication settings", () => {
    const result = loadRuntimeConfig({});
    const environment = {};

    applyRuntimeConfig(result, environment);

    assert.equal(result.nodeEnv, "development");
    assert.equal(
      result.mongodbUri,
      "mongodb://localhost/mern_app-template-withauth",
    );
    assert.equal(result.port, 3001);
    assert.equal(result.rateLimitRedisUrl, "redis://localhost:6379");
    assert.equal(result.rateLimitStore, "memory");
    assert.match(result.jwtAccessSecret, /development-only/u);
    assert.match(result.jwtRefreshSecret, /development-only/u);
    assert.notEqual(result.jwtAccessSecret, result.jwtRefreshSecret);
    assert.deepEqual(environment, {
      ACCESS_TOKEN_EXPIRES_IN: "15m",
      BCRYPT_ROUNDS: "12",
      JWT_ACCESS_SECRET: result.jwtAccessSecret,
      JWT_AUDIENCE: "mern-app-client",
      JWT_ISSUER: "mern-app-template",
      JWT_REFRESH_SECRET: result.jwtRefreshSecret,
      NODE_ENV: "development",
      REFRESH_COOKIE_MAX_AGE_MS: "604800000",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    });
  });

  it("rejects missing or starter credentials in production", () => {
    assert.throws(
      () =>
        loadRuntimeConfig({
          MONGODB_URI: "mongodb://database.example/application",
          NODE_ENV: "production",
        }),
      /JWT_ACCESS_SECRET is required in production/,
    );
    assert.throws(
      () =>
        loadRuntimeConfig({
          JWT_ACCESS_SECRET:
            "development-only-access-secret-never-use-in-production",
          JWT_REFRESH_SECRET:
            "development-only-refresh-secret-never-use-in-production",
          MONGODB_URI: "mongodb://database.example/application",
          NODE_ENV: "production",
        }),
      /development default/,
    );
  });

  it("rejects short, reused, or placeholder signing secrets", () => {
    assert.throws(
      () =>
        loadRuntimeConfig({
          JWT_ACCESS_SECRET: "short",
          JWT_REFRESH_SECRET: "another-short-secret",
        }),
      /at least 32 characters/,
    );

    const repeatedSecret = "one-secret-that-is-long-enough-for-both-tokens";
    assert.throws(
      () =>
        loadRuntimeConfig({
          JWT_ACCESS_SECRET: repeatedSecret,
          JWT_REFRESH_SECRET: repeatedSecret,
        }),
      /must be different/,
    );

    assert.throws(
      () =>
        loadRuntimeConfig({
          JWT_ACCESS_SECRET:
            "replace-with-a-unique-random-access-secret-of-32-or-more-characters",
          JWT_REFRESH_SECRET:
            "replace-with-a-different-random-refresh-secret-of-32-or-more-characters",
        }),
      /placeholder/,
    );
  });

  it("normalizes origins, ports, and token metadata", () => {
    const result = loadRuntimeConfig({
      CLIENT_ORIGINS: "https://app.example.com, https://admin.example.com ",
      JWT_ACCESS_SECRET: "access-secret-with-at-least-thirty-two-characters",
      JWT_AUDIENCE: "example-client",
      JWT_ISSUER: "example-server",
      JWT_REFRESH_SECRET: "refresh-secret-with-at-least-thirty-two-characters",
      MONGODB_URI: "mongodb://localhost/example",
      PORT: "4100",
      TRUST_PROXY: "1",
    });

    assert.deepEqual(result.clientOrigins, [
      "https://app.example.com",
      "https://admin.example.com",
    ]);
    assert.equal(result.port, 4100);
    assert.equal(result.jwtAudience, "example-client");
    assert.equal(result.jwtIssuer, "example-server");
    assert.equal(result.trustProxy, 1);
  });

  it("requires an explicit shared-store connection in production", () => {
    const baseEnvironment = {
      DEPLOYMENT_MODE: "single",
      JWT_ACCESS_SECRET: "access-secret-with-at-least-thirty-two-characters",
      JWT_REFRESH_SECRET: "refresh-secret-with-at-least-thirty-two-characters",
    };

    assert.throws(
      () =>
        loadRuntimeConfig({
          ...baseEnvironment,
          MONGODB_URI: "mongodb://localhost/example",
          NODE_ENV: "production",
          RATE_LIMIT_STORE: "redis",
        }),
      /RATE_LIMIT_REDIS_URL is required/,
    );

    const result = loadRuntimeConfig({
      ...baseEnvironment,
      NODE_ENV: "production",
      MONGODB_URI: "mongodb://localhost/example",
      RATE_LIMIT_REDIS_PREFIX: "example-production",
      RATE_LIMIT_REDIS_URL: "rediss://cache.example:6380",
      RATE_LIMIT_STORE: "redis",
    });

    assert.equal(result.rateLimitStore, "redis");
    assert.equal(result.rateLimitRedisPrefix, "example-production");
    assert.equal(result.rateLimitRedisUrl, "rediss://cache.example:6380");
  });

  it("rejects unsupported rate-limit stores and non-Redis connection URLs", () => {
    const baseEnvironment = {
      JWT_ACCESS_SECRET: "access-secret-with-at-least-thirty-two-characters",
      JWT_REFRESH_SECRET: "refresh-secret-with-at-least-thirty-two-characters",
    };

    assert.throws(
      () =>
        loadRuntimeConfig({
          ...baseEnvironment,
          RATE_LIMIT_STORE: "distributed-memory",
        }),
      /RATE_LIMIT_STORE must be memory or redis/,
    );
    assert.throws(
      () =>
        loadRuntimeConfig({
          ...baseEnvironment,
          RATE_LIMIT_REDIS_URL: "https://cache.example",
          RATE_LIMIT_STORE: "redis",
        }),
      /RATE_LIMIT_REDIS_URL must use redis:\/\/ or rediss:\/\//,
    );
  });
});
