/**
 * @module app/middleware/auth
 * @description Authentication and authorization middleware for Express routes.
 */

const jwt = require("jsonwebtoken");

/**
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} [user] - Authenticated token payload.
 * @property {string} [user.id] - User id.
 * @property {string} [user.email] - User email.
 * @property {string} [user.role] - User role.
 */

/**
 * Verify a bearer access token and attach decoded claims to `req.user`.
 * @param {AuthenticatedRequest} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Next middleware callback.
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Allow access only when `req.user.role` is one of the provided roles.
 * @param {...string} roles - Allowed role names.
 * @returns {Function} Role-check middleware.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if (!roles.includes(req.user.role)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
};

module.exports = { requireAuth, requireRole };
