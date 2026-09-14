/**
 * @module app/controllers/users
 * @description Thin HTTP adapters for injected account and device-session services.
 */
const { loadRuntimeConfig } = require("../../config/runtime/runtime.js");
const {
  createUserService,
  serializeUser,
} = require("../../services/users/users.js");

/**
 * Build refresh cookie attributes shared by issuance and removal.
 * @param {boolean} [includeMaxAge] Include persistent lifetime.
 * @param {Object} [config] Validated configuration.
 * @returns {Object} Cookie attributes.
 */
function getRefreshCookieOptions(
  includeMaxAge = true,
  config = loadRuntimeConfig(),
) {
  return {
    httpOnly: true,
    path: "/api/users",
    sameSite: "strict",
    secure: config.nodeEnv === "production",
    ...(includeMaxAge ? { maxAge: config.refreshCookieMaxAgeMs } : {}),
  };
}

/**
 * Compose HTTP handlers around one application-owned service instance.
 * @param {Object} options Dependencies.
 * @param {Object} options.config Runtime configuration.
 * @param {Object} [options.service] Account service override.
 * @returns {Object} Express handlers.
 */
function createUserController({
  config,
  service = createUserService({ config }),
}) {
  /**
   * Adapt a business operation to a safe JSON response.
   * @param {Function} operation Request operation.
   * @param {number} [status] Success status.
   * @returns {Function} Async Express handler.
   */
  function handle(operation, status = 200) {
    return async (req, res, next) => {
      // console.log("user API handler called", { method: req.method, path: req.path });
      try {
        const result = await operation(req, res);
        if (result.refreshToken)
          res.cookie(
            "refreshToken",
            result.refreshToken,
            getRefreshCookieOptions(true, config),
          );
        const { refreshToken, sid, ...payload } = result;
        void refreshToken;
        void sid;
        // console.log("user API handler return", { status });
        res.status(status).json(payload);
      } catch (error) {
        next(error);
      }
    };
  }
  /** Clear the browser cookie.
   * @param {Object} res Response.
   * @returns {void} */
  function clear(res) {
    res.clearCookie("refreshToken", getRefreshCookieOptions(false, config));
  }
  return {
    register: handle((req) => service.register(req.body), 201),
    create: handle((req) => service.create(req.body), 201),
    login: handle((req) => service.login(req.body)),
    findAll: handle((req) => service.findAll(req.query || {})),
    findById: handle((req) => service.findById(req.params.id)),
    currentUser: handle((req) => service.findById(req.user.id)),
    update: handle((req) => service.update(req.params.id, req.body, req.user)),
    remove: handle((req) => service.remove(req.params.id)),
    refreshToken: handle(async (req, res) => {
      try {
        const result = await service.sessions.refresh(
          req.cookies?.refreshToken,
        );
        return { ...result, user: serializeUser(result.user) };
      } catch (error) {
        if (error.statusCode === 401) clear(res);
        throw error;
      }
    }),
    logout: handle(async (req, res) => {
      await service.sessions.logout(req.cookies?.refreshToken);
      clear(res);
      return { message: "Logged out" };
    }),
    listSessions: handle(async (req) => ({
      sessions: await service.sessions.list(req.user.id),
      currentSessionId: req.user.sid,
    })),
    revokeSession: handle(async (req, res) => {
      await service.sessions.revoke(req.user.id, req.params.sessionId);
      if (req.params.sessionId === req.user.sid) clear(res);
      return { message: "Session revoked" };
    }),
    logoutAll: handle(async (req, res) => {
      await service.sessions.revokeAll(req.user.id);
      clear(res);
      return { message: "All sessions revoked" };
    }),
  };
}

/** Compatibility adapters for direct controller consumers; application routes inject their own instance.
 * @type {Object} */
const handlers = {};
for (const name of [
  "create",
  "currentUser",
  "findAll",
  "findById",
  "login",
  "logout",
  "refreshToken",
  "register",
  "remove",
  "update",
  "listSessions",
  "revokeSession",
  "logoutAll",
]) {
  handlers[name] = (req, res, next) =>
    createUserController({ config: loadRuntimeConfig() })[name](req, res, next);
}
module.exports = {
  ...handlers,
  createUserController,
  getRefreshCookieOptions,
  serializeUser,
};
