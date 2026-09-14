/**
 * @module app/controllers/users.test
 * @description HTTP adapter checks; account and rotation semantics are covered by service integration tests.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const { createUserController } = require("./users.js");
const { loadRuntimeConfig } = require("../../config/runtime/runtime.js");
/** Create a response recording cookie/body boundaries.
 * @returns {Object} Response.
 */
function response() {
  return {
    cookies: [],
    cleared: [],
    statusCode: 200,
    cookie(...args) {
      this.cookies.push(args);
    },
    clearCookie(...args) {
      this.cleared.push(args);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };
}
it("keeps refresh credentials in the protected cookie, not the JSON response", async () => {
  const controller = createUserController({
    config: loadRuntimeConfig({}),
    service: {
      register: async () => ({
        token: "access",
        refreshToken: "secret",
        sid: "device",
        user: { id: "user" },
      }),
    },
  });
  const res = response();
  await controller.register({ body: {} }, res, (error) => {
    throw error;
  });
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { token: "access", user: { id: "user" } });
  assert.equal(res.cookies[0][2].httpOnly, true);
  assert.equal(res.cookies[0][2].sameSite, "strict");
});
it("preserves cookies on refresh conflicts and infrastructure outages", async () => {
  for (const statusCode of [409, 503]) {
    const failure = Object.assign(new Error("retry"), { statusCode });
    const controller = createUserController({
      config: loadRuntimeConfig({}),
      service: {
        sessions: {
          refresh: async () => {
            throw failure;
          },
        },
      },
    });
    const res = response();
    let received;
    await controller.refreshToken(
      { cookies: { refreshToken: "cookie" } },
      res,
      (error) => {
        received = error;
      },
    );
    assert.equal(received, failure);
    assert.equal(res.cleared.length, 0);
  }
});
it("clears a confirmed invalid refresh cookie", async () => {
  const controller = createUserController({
    config: loadRuntimeConfig({}),
    service: {
      sessions: {
        refresh: async () => {
          throw Object.assign(new Error("invalid"), { statusCode: 401 });
        },
      },
    },
  });
  const res = response();
  await controller.refreshToken({ cookies: {} }, res, () => {});
  assert.equal(res.cleared.length, 1);
});
