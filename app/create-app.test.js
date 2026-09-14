/**
 * @module app/create-app.test
 * @description Focused HTTP-boundary tests for the configured Express application.
 */

const assert = require("node:assert/strict");
const { before, describe, it } = require("node:test");

process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "test-access-secret-with-at-least-thirty-two-bytes";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "test-refresh-secret-with-at-least-thirty-two-bytes";

const request = require("supertest");
const { createApp } = require("./create-app");

describe("Express application security boundary", () => {
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
});
