/**
 * @module app/routes/root-router.test
 * @description Verifies the public API mount survives router composition changes.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const express = require("express");
const request = require("supertest");

it("mounts authenticated user routes beneath /api", async () => {
  const { createRoutes } = require("./root-router.js");
  const app = express();
  app.use(createRoutes({ enableRateLimit: false }));
  const response = await request(app).get("/api/users/current").expect(401);
  assert.equal(typeof response.body.message, "string");
  await request(app).get("/users/current").expect(404);
});
