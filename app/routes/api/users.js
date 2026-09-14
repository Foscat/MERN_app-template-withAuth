/**
 * @module app/routes/api/users
 * @description Router for authentication and user CRUD endpoints.
 */

/** Express router for user and authentication endpoints. @type {Object} */
const router = require("express").Router();
const { rateLimit } = require("express-rate-limit");
const userController = require("../../controllers/users");
const {
  requireAuth,
  requireRole,
  requireSelfOrRole,
} = require("../../middleware/auth");

/** Rate limiter for credential and refresh-token endpoints. @type {Function} */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many authentication attempts; try again later" },
});

/** Register a new user. */
router.post("/register", authRateLimit, userController.register);

/** Authenticate a user and return an access token. */
router.post("/login", authRateLimit, userController.login);

/** Rotate refresh token and issue a new access token. */
router.post("/refresh", authRateLimit, userController.refreshToken);

/** Clear refresh cookie and end the session. */
router.post("/logout", userController.logout);

/** Return the currently authenticated user payload. */
router.get("/current", requireAuth, userController.currentUser);

/** List users or create a user as an administrator. */
router
  .route("/")
  .get(requireAuth, requireRole("admin"), userController.findAll)
  .post(requireAuth, requireRole("admin"), userController.create);

/** Read, update, or delete the authenticated user or an admin-managed user. */
router
  .route("/:id")
  .get(requireAuth, requireSelfOrRole("admin"), userController.findById)
  .put(requireAuth, requireSelfOrRole("admin"), userController.update)
  .delete(requireAuth, requireSelfOrRole("admin"), userController.remove);

module.exports = router;
