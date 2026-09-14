/**
 * @module app/utils/tokens
 * @description Strict, purpose-bound JSON Web Token signing and verification helpers.
 */

const jwt = require("jsonwebtoken");

const TOKEN_ALGORITHM = "HS256";

/**
 * Read common JWT metadata from runtime configuration.
 *
 * @returns {{algorithm: string, audience: string, issuer: string}} Signing options.
 */
function getSigningMetadata() {
  return {
    algorithm: TOKEN_ALGORITHM,
    audience: process.env.JWT_AUDIENCE || "mern-app-client",
    issuer: process.env.JWT_ISSUER || "mern-app-template",
  };
}

/**
 * Read strict JWT verification settings.
 *
 * @returns {{algorithms: string[], audience: string, issuer: string}} Verification options.
 */
function getVerificationMetadata() {
  const { audience, issuer } = getSigningMetadata();
  return { algorithms: [TOKEN_ALGORITHM], audience, issuer };
}

/**
 * Build stable public claims from a user document.
 *
 * @param {{_id: unknown, email: string, role: string}} user - User document.
 * @returns {{sub: string, id: string, email: string, role: string}} Public claims.
 */
function buildAccessClaims(user) {
  const id = String(user._id);
  return { sub: id, id, email: user.email, role: user.role };
}

/**
 * Sign a short-lived access token.
 *
 * @param {{_id: unknown, email: string, role: string}} user - User document.
 * @returns {string} Signed access token.
 */
function signAccessToken(user) {
  return jwt.sign(
    { ...buildAccessClaims(user), type: "access" },
    process.env.JWT_ACCESS_SECRET,
    {
      ...getSigningMetadata(),
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    },
  );
}

/**
 * Sign a long-lived refresh token tied to a server-side session version.
 *
 * @param {{_id: unknown, tokenVersion: number}} user - User document.
 * @returns {string} Signed refresh token.
 */
function signRefreshToken(user) {
  const id = String(user._id);
  return jwt.sign(
    {
      sub: id,
      id,
      tokenVersion: user.tokenVersion || 0,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      ...getSigningMetadata(),
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    },
  );
}

/**
 * Verify a refresh token and enforce its intended token type.
 *
 * @param {string} token - Encoded refresh token.
 * @returns {Object} Verified refresh-token claims.
 * @throws {Error} When verification or type validation fails.
 */
function verifyRefreshToken(token) {
  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET,
    getVerificationMetadata(),
  );

  if (typeof decoded === "string" || decoded.type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }

  return decoded;
}

module.exports = {
  buildAccessClaims,
  getSigningMetadata,
  getVerificationMetadata,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
