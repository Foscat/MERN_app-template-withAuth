/**
 * @module app/routes/api-router.test
 * @description Verifies resource mounting and authentication quota propagation using the application's JSON error boundary.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const express = require("express");
const request = require("supertest");
const { errorHandler } = require("../../create-app/create-app.js");

it("mounts user validation and propagates disabled authentication quotas", async () => {
  const { createApiRouter } = require("./api-router.js");
  const app = express();
  app.use(express.json());
  app.use(createApiRouter({ enableRateLimit: false }));
  app.use(errorHandler);
  for (let attempt = 0; attempt < 11; attempt += 1) {
    const response = await request(app)
      .post("/users/login")
      .send({})
      .expect("Content-Type", /json/u)
      .expect(400);
    assert.equal(typeof response.body.message, "string");
    assert.equal(response.body.code, "HTTP_400");
  }
});
