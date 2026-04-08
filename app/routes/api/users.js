/**
 * @module app/routes/api/users
 * @description Router for authentication and user CRUD endpoints.
 */

const router = require("express").Router();
const userController = require("../../controllers/users");
const { requireAuth } = require("../../middleware/auth");

/** Register a new user. */
router.post("/register", (req, res) => userController.register(req, res));

/** Authenticate a user and return an access token. */
router.post("/login", (req, res) => userController.login(req, res));

/** Rotate refresh token and issue a new access token. */
router.post("/refresh", (req, res) => userController.refreshToken(req, res));

/** Clear refresh cookie and end the session. */
router.post("/logout", (req, res) => userController.logout(req, res));

/** Return the currently authenticated user payload. */
router.get("/current", requireAuth, (req, res) =>
  userController.currentUser(req, res)
);

/** List users or create a user. */
router
  .route("/")
  .get((req, res) => userController.findAll(req, res))
  .post((req, res) => userController.create(req, res));

/** Read, update, or delete a user by id. */
router
  .route("/:id")
  .get((req, res) => userController.findById(req, res))
  .put((req, res) => userController.update(req, res))
  .delete((req, res) => userController.remove(req, res));

module.exports = router;
