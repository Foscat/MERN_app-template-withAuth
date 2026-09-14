/**
 * @module app/middleware/auth
 * @description Authentication and authorization middleware for Express routes.
 */

/**
 * @typedef {Object} TokenClaims
 * @property {string} id - User identifier.
 * @property {string} email - User email address.
 * @property {string} role - Authorization role.
 */

/**
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} headers - Request headers.
 * @property {TokenClaims} [user] - Verified access-token claims.
 */

/**
 * @typedef {Object} ExpressResponse
 */

/**
 * @callback NextFunction
 * @returns {void}
 */

/**
 * Verify a bearer access token and attach decoded claims to `req.user`.
 * @param {AuthenticatedRequest} req - Express request.
 * @param {ExpressResponse} res - Express response.
 * @param {NextFunction} next - Next middleware callback.
 * @returns {void}
 */
const requireAuth = async (req, res, next) => {
  // console.log("requireAuth middleware called", { path: req.path });
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = await req.app.locals.userService.sessions.authorize(token);
    // console.log("requireAuth middleware return", { userId: req.user.id });
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Allow access only when `req.user.role` is one of the provided roles.
 * @param {...string} roles - Allowed role names.
 * @returns {Function} Role-check middleware.
 */
const requireRole =
  (...roles) =>
  (req, res, next) => {
    // console.log("requireRole middleware called", { allowedRoles: roles });
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    // console.log("requireRole middleware authorized", { userId: req.user.id });
    next();
  };

/**
 * Allow access to a matching user resource or to an elevated role.
 *
 * @param {...string} roles - Roles permitted to access any user resource.
 * @returns {Function} Owner-or-role authorization middleware.
 */
const requireSelfOrRole =
  (...roles) =>
  (req, res, next) => {
    // console.log("requireSelfOrRole middleware called", { resourceId: req.params.id });
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const isOwner = String(req.user.id) === String(req.params.id);
    const hasElevatedRole = roles.includes(req.user.role);

    if (!isOwner && !hasElevatedRole) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    // console.log("requireSelfOrRole middleware authorized", { userId: req.user.id });
    next();
  };

module.exports = { requireAuth, requireRole, requireSelfOrRole };
