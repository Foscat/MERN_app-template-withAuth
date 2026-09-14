/**
 * @module app/routes/users-router
 * @description Router for authentication and user CRUD endpoints.
 */

const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { userController } = require("../../controllers/index.js");
const {
  requireAuth,
  requireRole,
  requireSelfOrRole,
} = require("../../middleware/index.js");

/**
 * Create the user router with an optional shared authentication limiter store.
 *
 * @param {Object} [options] - Router configuration.
 * @param {Object} [options.authRateLimitStore] - Store dedicated to authentication quotas.
 * @param {boolean} [options.enableRateLimit] - Whether authentication quotas are enforced.
 * @returns {Object} Configured Express router.
 */
function createUsersRouter({
  userController: controller = userController,
  authRateLimitStore,
  enableRateLimit = true,
} = {}) {
  const router = express.Router();
  router.get("/sessions", requireAuth, controller.listSessions);
  router.delete("/sessions/:sessionId", requireAuth, controller.revokeSession);
  router.post("/logout-all", requireAuth, controller.logoutAll);
  const authRateLimitMiddleware = enableRateLimit
    ? [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: 10,
          standardHeaders: "draft-8",
          legacyHeaders: false,
          skipSuccessfulRequests: true,
          message: {
            message: "Too many authentication attempts; try again later",
          },
          ...(authRateLimitStore ? { store: authRateLimitStore } : {}),
        }),
      ]
    : [];

  /** Register a new user. */
  router.post("/register", ...authRateLimitMiddleware, controller.register);

  /** Authenticate a user and return an access token. */
  router.post("/login", ...authRateLimitMiddleware, controller.login);

  /** Rotate refresh token and issue a new access token. */
  router.post("/refresh", ...authRateLimitMiddleware, controller.refreshToken);

  /** Clear refresh cookie and end the session. */
  router.post("/logout", controller.logout);

  /** Return the currently authenticated user payload. */
  router.get("/current", requireAuth, controller.currentUser);

  /** List users or create a user as an administrator. */
  router
    .route("/")
    .get(requireAuth, requireRole("admin"), controller.findAll)
    .post(requireAuth, requireRole("admin"), controller.create);

  /** Read, update, or delete the authenticated user or an admin-managed user. */
  router
    .route("/:id")
    .get(requireAuth, requireSelfOrRole("admin"), controller.findById)
    .put(requireAuth, requireSelfOrRole("admin"), controller.update)
    .delete(requireAuth, requireSelfOrRole("admin"), controller.remove);

  return router;
}

module.exports = { createUsersRouter };
