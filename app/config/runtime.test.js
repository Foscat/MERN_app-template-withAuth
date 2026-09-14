/**
 * @module app/config/runtime.test
 * @description Focused tests for runtime environment validation and normalization.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { loadRuntimeConfig } = require("./runtime");

describe("runtime configuration", () => {
  it("rejects missing, short, or reused signing secrets", () => {
    assert.throws(() => loadRuntimeConfig({}), /JWT_ACCESS_SECRET is required/);
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
});
