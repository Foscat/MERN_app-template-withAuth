/**
 * @module app/middleware/auth.test
 * @description Focused tests for JWT verification and resource authorization middleware.
 */

const assert = require("node:assert/strict");
const { before, describe, it } = require("node:test");
const { createSessionService } = require("../../services/sessions/sessions.js");
const { loadRuntimeConfig } = require("../../config/runtime/runtime.js");
const jwt = require("jsonwebtoken");

const TEST_SECRET = "test-access-secret-with-at-least-thirty-two-bytes";

/**
 * Create a minimal Express response double.
 *
 * @returns {{statusCode: number, body: unknown, status: Function, json: Function}} Response double.
 */
function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe("authentication middleware", () => {
  let requireAuth;
  let requireSelfOrRole;

  before(() => {
    process.env.JWT_ACCESS_SECRET = TEST_SECRET;
    process.env.JWT_ISSUER = "test-issuer";
    process.env.JWT_AUDIENCE = "test-audience";
    ({ requireAuth, requireSelfOrRole } = require("./auth.js"));
  });

  it("rejects a request without a bearer token", () => {
    const req = { headers: {} };
    const res = createResponse();
    let called = false;

    requireAuth(req, res, () => {
      called = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(called, false);
  });

  it("rejects legacy or incorrectly scoped tokens through the injected session boundary", async () => {
    const config = loadRuntimeConfig({});
    const sessions = createSessionService({ config });
    for (const token of [
      jwt.sign({ id: "legacy", type: "access" }, config.jwtAccessSecret, {
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      }),
      jwt.sign(
        {
          sub: "507f1f77bcf86cd799439011",
          sid: "device",
          generation: 0,
          v: 2,
          type: "access",
        },
        config.jwtAccessSecret,
        { issuer: config.jwtIssuer, audience: "wrong" },
      ),
    ]) {
      let failure;
      await requireAuth(
        {
          headers: { authorization: `Bearer ${token}` },
          app: { locals: { userService: { sessions } } },
        },
        createResponse(),
        (error) => {
          failure = error;
        },
      );
      assert.equal(failure.statusCode, 401);
    }
  });

  it("allows resource owners and configured elevated roles", () => {
    const middleware = requireSelfOrRole("admin");
    const ownerResponse = createResponse();
    let ownerCalled = false;
    middleware(
      { params: { id: "user-1" }, user: { id: "user-1", role: "user" } },
      ownerResponse,
      () => {
        ownerCalled = true;
      },
    );
    assert.equal(ownerCalled, true);

    const otherResponse = createResponse();
    middleware(
      { params: { id: "user-2" }, user: { id: "user-1", role: "user" } },
      otherResponse,
      () => assert.fail("another user must not pass"),
    );
    assert.equal(otherResponse.statusCode, 403);
  });
});
