/**
 * @module app/routes/users-router.test
 * @description Verifies user-route quotas without database or external-service access.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const express = require("express");
const request = require("supertest");

it("limits failed authentication while retaining protected user routes", async () => {
  const { createUsersRouter } = require("./users-router.js");
  const app = express();
  app.use(express.json());
  app.use(createUsersRouter());
  app.use(require("../../create-app/create-app.js").errorHandler);
  await request(app).get("/current").expect(401);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await request(app).post("/login").send({}).expect(400);
  }
  const response = await request(app).post("/login").send({}).expect(429);
  assert.equal(
    response.body.message,
    "Too many authentication attempts; try again later",
  );
});
