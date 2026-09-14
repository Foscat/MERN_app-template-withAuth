/**
 * @module app/controllers/users
 * @description Authenticated user CRUD and rotating cookie-session controller methods.
 */

const db = require("../models");
const {
  ValidationError,
  buildUserListFilter,
  validateLoginInput,
  validateRegistrationInput,
  validateUserUpdateInput,
} = require("../utils/user-validation");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");
const hash = require("./hash");

const PUBLIC_USER_FIELDS =
  "name username email phoneNumber role createdAt updatedAt";
const DEFAULT_REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * @typedef {Object} AuthenticatedRequest
 * @property {Record<string, unknown>} [body] - Parsed request body.
 * @property {Record<string, string>} [cookies] - Parsed request cookies.
 * @property {Object} [params] - Route parameters.
 * @property {string} [params.id] - Target user identifier.
 * @property {Record<string, unknown>} [query] - Query parameters.
 * @property {{id: string, role: string}} [user] - Verified access-token claims.
 */

/**
 * @typedef {Object} ExpressResponse
 * @property {Function} cookie - Set a response cookie.
 * @property {Function} clearCookie - Clear a response cookie.
 * @property {Function} json - Send a JSON response.
 * @property {Function} status - Set the status code.
 */

/**
 * Build consistent options for the refresh-token cookie.
 *
 * @param {boolean} [includeMaxAge] - Whether to include persistent lifetime metadata.
 * @returns {Record<string, unknown>} Express cookie options.
 */
function getRefreshCookieOptions(includeMaxAge = true) {
  const options = {
    httpOnly: true,
    path: "/api/users",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  if (includeMaxAge) {
    const configuredMaxAge = Number.parseInt(
      process.env.REFRESH_COOKIE_MAX_AGE_MS,
      10,
    );
    options.maxAge = Number.isInteger(configuredMaxAge)
      ? configuredMaxAge
      : DEFAULT_REFRESH_COOKIE_MAX_AGE;
  }

  return options;
}

/**
 * Attach a refresh token as a protected cookie.
 *
 * @param {ExpressResponse} res - Express response.
 * @param {string} token - Signed refresh token.
 * @returns {void}
 */
function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, getRefreshCookieOptions());
}

/**
 * Serialize a user without credential or persistence internals.
 *
 * @param {Object} user - User document or plain object.
 * @returns {Record<string, unknown>} Public user data.
 */
function serializeUser(user) {
  if (typeof user.toJSON === "function") {
    return user.toJSON();
  }

  const publicUser = { ...user };
  publicUser.id = String(publicUser.id || publicUser._id);
  delete publicUser._id;
  delete publicUser.__v;
  delete publicUser.password;
  delete publicUser.tokenVersion;
  return publicUser;
}

/**
 * Convert known controller errors to client-safe response messages.
 *
 * @param {ExpressResponse} res - Express response.
 * @param {Error} error - Caught failure with optional database metadata.
 * @param {string} action - Operation label for optional local tracing.
 * @returns {void}
 */
function sendControllerError(res, error, action) {
  // console.log("user controller error", { action, name: error.name, code: error.code });
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error.code === 11000) {
    res.status(409).json({ message: "Email or username is already in use" });
    return;
  }

  if (error.name === "CastError" || error.name === "ValidationError") {
    res.status(400).json({ message: "User data is invalid" });
    return;
  }

  res.status(500).json({ message: `${action} failed` });
}

/**
 * Create a user through either the public or admin endpoint.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @param {{allowRole: boolean, issueSession: boolean}} options - Creation behavior.
 * @returns {Promise<void>}
 */
async function createUser(req, res, { allowRole, issueSession }) {
  const input = validateRegistrationInput(req.body);
  const duplicate = await db.User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (duplicate) {
    res.status(409).json({ message: "Email or username is already in use" });
    return;
  }

  let role = "user";
  if (allowRole && req.body.role !== undefined) {
    ({ role } = validateUserUpdateInput(
      { role: req.body.role },
      { allowRole: true },
    ));
  }

  const user = await db.User.create({
    ...input,
    password: await hash.hashThis(input.password),
    role,
  });

  if (!issueSession) {
    res.status(201).json({ user: serializeUser(user) });
    return;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  setRefreshCookie(res, refreshToken);
  res.status(201).json({ token: accessToken, user: serializeUser(user) });
}

/**
 * Return a bounded, allowlisted page of users to an administrator.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function findAll(req, res) {
  // console.log("findAll API handler called", { queryKeys: Object.keys(req.query || {}) });
  try {
    const { filter, limit, skip } = buildUserListFilter(req.query || {});
    const [users, total] = await Promise.all([
      db.User.find(filter)
        .select(PUBLIC_USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      db.User.countDocuments(filter),
    ]);

    // console.log("findAll API handler return", { count: users.length, total });
    res.json({
      users: users.map(serializeUser),
      pagination: { limit, skip, total },
    });
  } catch (error) {
    sendControllerError(res, error, "User listing");
  }
}

/**
 * Return an authorized user by identifier.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function findById(req, res) {
  // console.log("findById API handler called", { resourceId: req.params.id });
  try {
    const user = await db.User.findById(req.params.id)
      .select(PUBLIC_USER_FIELDS)
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // console.log("findById API handler return", { resourceId: req.params.id });
    res.json({ user: serializeUser(user) });
  } catch (error) {
    sendControllerError(res, error, "User lookup");
  }
}

/**
 * Register a public user without accepting authorization fields.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function register(req, res) {
  // console.log("register API handler called", { hasBody: Boolean(req.body) });
  try {
    await createUser(req, res, { allowRole: false, issueSession: true });
    // console.log("register API handler return", { statusCode: res.statusCode });
  } catch (error) {
    sendControllerError(res, error, "Registration");
  }
}

/**
 * Create a user through the administrator-only collection route.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function create(req, res) {
  // console.log("create user API handler called", { actorId: req.user?.id });
  try {
    await createUser(req, res, { allowRole: true, issueSession: false });
    // console.log("create user API handler return", { statusCode: res.statusCode });
  } catch (error) {
    sendControllerError(res, error, "User creation");
  }
}

/**
 * Update allowlisted user fields and invalidate sessions after password changes.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function update(req, res) {
  // console.log("update user API handler called", { resourceId: req.params.id });
  try {
    const updateData = validateUserUpdateInput(req.body, {
      allowRole: req.user?.role === "admin",
    });
    const changes = { ...updateData };
    const updateOperations = { $set: changes };

    if (changes.password) {
      changes.password = await hash.hashThis(changes.password);
      updateOperations.$inc = { tokenVersion: 1 };
    }

    const user = await db.User.findByIdAndUpdate(
      req.params.id,
      updateOperations,
      { context: "query", new: true, runValidators: true },
    ).select(PUBLIC_USER_FIELDS);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // console.log("update user API handler return", { resourceId: req.params.id });
    res.json({ user: serializeUser(user) });
  } catch (error) {
    sendControllerError(res, error, "User update");
  }
}

/**
 * Delete an authorized user using the supported Mongoose operation.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function remove(req, res) {
  // console.log("remove user API handler called", { resourceId: req.params.id });
  try {
    const user = await db.User.findByIdAndDelete(req.params.id).select(
      PUBLIC_USER_FIELDS,
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // console.log("remove user API handler return", { resourceId: req.params.id });
    res.json({ user: serializeUser(user) });
  } catch (error) {
    sendControllerError(res, error, "User deletion");
  }
}

/**
 * Authenticate credentials, invalidate older sessions, and issue new tokens.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function login(req, res) {
  // console.log("login API handler called", { hasBody: Boolean(req.body) });
  try {
    const { email, password } = validateLoginInput(req.body);
    const user = await db.User.findOne({ email }).select(
      "+password +tokenVersion",
    );

    if (!user || !(await hash.compareHash(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateModifiedOnly: true });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    setRefreshCookie(res, refreshToken);
    // console.log("login API handler return", { userId: String(user._id) });
    res.json({ token: accessToken, user: serializeUser(user) });
  } catch (error) {
    sendControllerError(res, error, "Login");
  }
}

/**
 * Rotate a valid refresh session and issue a new access token.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function refreshToken(req, res) {
  // console.log("refreshToken API handler called", { hasCookie: Boolean(req.cookies?.refreshToken) });
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await db.User.findById(decoded.sub).select("+tokenVersion");

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.clearCookie("refreshToken", getRefreshCookieOptions(false));
      res.status(403).json({ message: "Refresh session is no longer valid" });
      return;
    }

    user.tokenVersion += 1;
    await user.save({ validateModifiedOnly: true });
    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    setRefreshCookie(res, newRefreshToken);
    // console.log("refreshToken API handler return", { userId: String(user._id) });
    res.json({ token: accessToken, user: serializeUser(user) });
  } catch {
    res.clearCookie("refreshToken", getRefreshCookieOptions(false));
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

/**
 * Invalidate the current refresh session and clear its cookie.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function logout(req, res) {
  // console.log("logout API handler called", { hasCookie: Boolean(req.cookies?.refreshToken) });
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await db.User.findById(decoded.sub).select("+tokenVersion");
      if (user && user.tokenVersion === decoded.tokenVersion) {
        user.tokenVersion += 1;
        await user.save({ validateModifiedOnly: true });
      }
    } catch {
      // Invalid cookies are cleared below without exposing verification details.
    }
  }

  res.clearCookie("refreshToken", getRefreshCookieOptions(false));
  // console.log("logout API handler return", { cleared: true });
  res.status(200).json({ message: "Logged out" });
}

/**
 * Return fresh database-backed data for the authenticated user.
 *
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @returns {Promise<void>}
 */
async function currentUser(req, res) {
  // console.log("currentUser API handler called", { userId: req.user?.id });
  try {
    const user = await db.User.findById(req.user.id)
      .select(PUBLIC_USER_FIELDS)
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // console.log("currentUser API handler return", { userId: req.user.id });
    res.json({ user: serializeUser(user) });
  } catch (error) {
    sendControllerError(res, error, "Current-user lookup");
  }
}

module.exports = {
  create,
  currentUser,
  findAll,
  findById,
  getRefreshCookieOptions,
  login,
  logout,
  refreshToken,
  register,
  remove,
  serializeUser,
  update,
};
