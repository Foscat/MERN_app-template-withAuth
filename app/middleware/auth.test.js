/**
 * @module app/middleware/auth.test
 * @description Focused tests for JWT verification and resource authorization middleware.
 */

const assert = require("node:assert/strict");
const { before, describe, it } = require("node:test");
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
    ({ requireAuth, requireSelfOrRole } = require("./auth"));
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

  it("accepts only the configured algorithm, issuer, and audience", () => {
    const validToken = jwt.sign(
      { id: "user-1", email: "user@example.com", role: "user", type: "access" },
      TEST_SECRET,
      {
        algorithm: "HS256",
        audience: "test-audience",
        issuer: "test-issuer",
        expiresIn: "5m",
      },
    );
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = createResponse();
    let called = false;

    requireAuth(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
    assert.equal(req.user.id, "user-1");

    const wrongAudience = jwt.sign({ id: "user-1" }, TEST_SECRET, {
      algorithm: "HS256",
      audience: "another-client",
      issuer: "test-issuer",
    });
    const rejectedResponse = createResponse();
    let rejectedCalled = false;
    requireAuth(
      { headers: { authorization: `Bearer ${wrongAudience}` } },
      rejectedResponse,
      () => {
        rejectedCalled = true;
      },
    );
    assert.equal(rejectedResponse.statusCode, 401);
    assert.equal(rejectedCalled, false);

    const wrongType = jwt.sign(
      { id: "user-1", type: "refresh", tokenVersion: 0 },
      TEST_SECRET,
      {
        algorithm: "HS256",
        audience: "test-audience",
        issuer: "test-issuer",
      },
    );
    const wrongTypeResponse = createResponse();
    requireAuth(
      { headers: { authorization: `Bearer ${wrongType}` } },
      wrongTypeResponse,
      () => {
        rejectedCalled = true;
      },
    );
    assert.equal(wrongTypeResponse.statusCode, 401);
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
