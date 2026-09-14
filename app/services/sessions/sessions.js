/** @module app/services/sessions
 * @description MongoDB-authoritative device sessions with atomic rotation and immediate revocation.
 */
const { randomUUID, createHash } = require("node:crypto");
const jwt = require("jsonwebtoken");
const models = require("../../models/index.js");

/** Create a client-safe session failure.
 * @param {string} code Stable code.
 * @param {number} [statusCode] HTTP status.
 * @returns {Error} Typed failure. */
function sessionError(code, statusCode = 401) {
  return Object.assign(
    new Error(
      code === "REFRESH_CONFLICT"
        ? "Session is refreshing; retry shortly"
        : "Session is no longer valid",
    ),
    { code, statusCode },
  );
}
/** Hash a verifier before storing it.
 * @param {string} token Signed credential.
 * @returns {string} SHA-256 digest. */
function digest(token) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create an isolated authentication service; no process-global configuration is mutated.
 * @param {Object} options Service dependencies.
 * @param {Object} options.config Validated runtime configuration.
 * @param {Object} [options.repository] Mongoose model boundary.
 * @param {Function} [options.now] Clock returning epoch milliseconds.
 * @returns {Object} Session operations.
 */
function createSessionService({ config, repository = models, now = Date.now }) {
  const metadata = {
    algorithm: "HS256",
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  };
  const verification = {
    algorithms: ["HS256"],
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  };
  /** Verify purpose, format, and required identifiers.
   * @param {string} token Credential.
   * @param {string} type Purpose.
   * @returns {Object} Claims. */
  function verify(token, type) {
    let claims;
    try {
      claims = jwt.verify(
        token,
        type === "access" ? config.jwtAccessSecret : config.jwtRefreshSecret,
        { ...verification, clockTimestamp: Math.floor(now() / 1000) },
      );
    } catch {
      throw sessionError("SESSION_INVALID");
    }
    if (
      claims.v !== 2 ||
      claims.type !== type ||
      typeof claims.sid !== "string" ||
      !/^[a-f\d]{24}$/iu.test(claims.sub) ||
      !Number.isSafeInteger(claims.generation)
    )
      throw sessionError("SESSION_INVALID");
    return claims;
  }
  /** Build a token pair with a fixed absolute session expiry.
   * @param {Object} user Account.
   * @param {Object} session Device record.
   * @returns {Object} Credentials. */
  function pair(user, session) {
    const claims = {
      sub: String(user._id),
      sid: session._id,
      generation: session.generation,
      v: 2,
    };
    const refreshToken = jwt.sign(
      {
        ...claims,
        type: "refresh",
        jti: randomUUID(),
        exp: Math.floor(new Date(session.expiresAt).getTime() / 1000),
      },
      config.jwtRefreshSecret,
      metadata,
    );
    const token = jwt.sign(
      {
        ...claims,
        type: "access",
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
      config.jwtAccessSecret,
      { ...metadata, expiresIn: config.accessTokenExpiresIn },
    );
    return { token, refreshToken, sid: session._id };
  }
  /** Load current account and an unexpired device record.
   * @param {Object} claims Verified claims.
   * @returns {Promise<Object>} Account and session. */
  async function active(claims) {
    const [session, user] = await Promise.all([
      repository.Session.findById(claims.sid).select("+refreshHash").lean(),
      repository.User.findById(claims.sub).select("+tokenVersion").lean(),
    ]);
    if (
      !session ||
      !user ||
      String(session.userId) !== claims.sub ||
      session.revokedAt ||
      new Date(session.expiresAt).getTime() <= now() ||
      session.tokenVersion !== (user.tokenVersion || 0)
    )
      throw sessionError("SESSION_INVALID");
    return { session, user };
  }
  /** Issue an independent device session.
   * @param {Object} user Account.
   * @returns {Promise<Object>} Token pair. */
  async function issue(user) {
    // console.log("session issue API called", { userId: String(user._id) });
    const duration =
      jwt.decode(
        jwt.sign({}, config.jwtRefreshSecret, {
          expiresIn: config.refreshTokenExpiresIn,
        }),
      ).exp *
        1000 -
      Date.now();
    const session = {
      _id: randomUUID(),
      userId: user._id,
      tokenVersion: user.tokenVersion || 0,
      generation: 0,
      expiresAt: new Date(
        now() + Math.min(duration, config.refreshCookieMaxAgeMs),
      ),
      rotatedAt: new Date(now()),
    };
    const tokens = pair(user, session);
    await repository.Session.create({
      ...session,
      refreshHash: digest(tokens.refreshToken),
    });
    // console.log("session issue API return", { sessionId: session._id });
    return tokens;
  }
  /** Rotate exactly once across all instances.
   * @param {string} token Refresh credential.
   * @returns {Promise<Object>} New credentials and account. */
  async function refresh(token) {
    // console.log("session refresh API called");
    const claims = verify(token, "refresh");
    const { session, user } = await active(claims);
    if (
      claims.generation !== session.generation ||
      digest(token) !== session.refreshHash
    ) {
      if (
        claims.generation === session.generation - 1 &&
        now() - new Date(session.rotatedAt).getTime() <= 5000
      )
        throw sessionError("REFRESH_CONFLICT", 409);
      await repository.Session.updateOne(
        { _id: session._id },
        { $set: { revokedAt: new Date(now()) } },
      );
      throw sessionError("REFRESH_REUSED");
    }
    const tokens = pair(user, {
      ...session,
      generation: session.generation + 1,
    });
    const result = await repository.Session.updateOne(
      {
        _id: session._id,
        generation: session.generation,
        refreshHash: session.refreshHash,
        revokedAt: null,
      },
      {
        $set: {
          refreshHash: digest(tokens.refreshToken),
          rotatedAt: new Date(now()),
        },
        $inc: { generation: 1 },
      },
    );
    if (result.modifiedCount !== 1) throw sessionError("REFRESH_CONFLICT", 409);
    // console.log("session refresh API return", { sessionId: session._id });
    return { ...tokens, user };
  }
  /** Authorize from current database state, never stale role claims.
   * @param {string} token Access token.
   * @returns {Promise<Object>} Request principal. */
  async function authorize(token) {
    const claims = verify(token, "access");
    const { user } = await active(claims);
    return {
      id: String(user._id),
      email: user.email,
      role: user.role,
      sid: claims.sid,
    };
  }
  /** Revoke one device owned by an account.
   * @param {string} userId Owner.
   * @param {string} sid Session ID.
   * @returns {Promise<void>} Completion. */
  async function revoke(userId, sid) {
    await repository.Session.updateOne(
      { _id: sid, userId },
      { $set: { revokedAt: new Date(now()) } },
    );
  }
  /** Invalidate every session including concurrently issued credentials.
   * @param {string} userId Owner.
   * @returns {Promise<void>} Completion. */
  async function revokeAll(userId) {
    await repository.User.updateOne(
      { _id: userId },
      { $inc: { tokenVersion: 1 } },
    );
    await repository.Session.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date(now()) } },
    );
  }
  /** End a refresh-cookie session; invalid credentials are harmless.
   * @param {string} token Refresh credential.
   * @returns {Promise<void>} Completion. */
  async function logout(token) {
    let claims;
    try {
      claims = verify(token, "refresh");
    } catch {
      return;
    }
    await revoke(claims.sub, claims.sid);
  }
  /** List only safe, active session metadata.
   * @param {string} userId Owner.
   * @returns {Promise<Object[]>} Device records. */
  async function list(userId) {
    const user = await repository.User.findById(userId)
      .select("+tokenVersion")
      .lean();
    return repository.Session.find({
      userId,
      tokenVersion: user?.tokenVersion || 0,
      revokedAt: null,
      expiresAt: { $gt: new Date(now()) },
    })
      .setOptions({ sanitizeFilter: false })
      .select("_id createdAt rotatedAt expiresAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }
  return { issue, refresh, authorize, logout, list, revoke, revokeAll };
}
module.exports = { createSessionService };
