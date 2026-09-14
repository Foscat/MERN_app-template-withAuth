/**
 * @module app/utils/tokens.test
 * @description Focused tests for typed access and refresh token contracts.
 */

const assert = require("node:assert/strict");
const { before, describe, it } = require("node:test");
const jwt = require("jsonwebtoken");

describe("JWT utilities", () => {
  let signAccessToken;
  let signRefreshToken;
  let verifyRefreshToken;

  before(() => {
    process.env.JWT_ACCESS_SECRET =
      "test-access-secret-with-at-least-thirty-two-bytes";
    process.env.JWT_REFRESH_SECRET =
      "test-refresh-secret-with-at-least-thirty-two-bytes";
    process.env.JWT_AUDIENCE = "test-client";
    process.env.JWT_ISSUER = "test-server";
    ({
      signAccessToken,
      signRefreshToken,
      verifyRefreshToken,
    } = require("./tokens"));
  });

  it("signs typed tokens with strict metadata and session version", () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      role: "user",
      tokenVersion: 4,
    };
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const decodedAccess = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET,
      {
        algorithms: ["HS256"],
        audience: "test-client",
        issuer: "test-server",
      },
    );
    const decodedRefresh = verifyRefreshToken(refreshToken);

    assert.equal(decodedAccess.type, "access");
    assert.equal(decodedAccess.sub, String(user._id));
    assert.equal(decodedAccess.tokenVersion, undefined);
    assert.equal(decodedRefresh.type, "refresh");
    assert.equal(decodedRefresh.tokenVersion, 4);
  });

  it("rejects an access token presented as a refresh token", () => {
    const forgedType = jwt.sign(
      { sub: "user-1", type: "access", tokenVersion: 0 },
      process.env.JWT_REFRESH_SECRET,
      {
        algorithm: "HS256",
        audience: "test-client",
        issuer: "test-server",
      },
    );

    assert.throws(() => verifyRefreshToken(forgedType), /refresh token type/);
  });
});
