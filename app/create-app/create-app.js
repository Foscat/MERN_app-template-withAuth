/**
 * @module app/create-app
 * @description Express application factory with security, parsing, CORS, and error boundaries.
 */

const path = require("node:path");
const fs = require("node:fs");
const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
const { loadRuntimeConfig } = require("../config/runtime/runtime.js");
const { createUserService } = require("../services/users/users.js");
const { createUserController } = require("../controllers/users/users.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const { createRoutes } = require("../routes/index.js");

/**
 * Parse a comma-separated origin list from environment configuration.
 *
 * @param {string|undefined} value - Raw environment value.
 * @returns {string[]} Normalized origin allowlist.
 */
function parseClientOrigins(value) {
  return (value || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Create a callback that permits non-browser requests and allowlisted origins.
 *
 * @param {string[]} allowedOrigins - Exact browser origins permitted by CORS.
 * @returns {Function} CORS origin callback.
 */
function createOriginValidator(allowedOrigins) {
  const allowed = new Set(allowedOrigins);

  return (origin, callback) => {
    // console.log("CORS origin validation called", { origin: origin || "non-browser" });
    if (!origin || allowed.has(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error("Origin is not allowed");
    error.statusCode = 403;
    callback(error);
  };
}

/**
 * Send client-safe JSON for unhandled application errors.
 *
 * @param {Error} error - Express error with optional HTTP metadata.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Express next callback.
 * @returns {void}
 */
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.name === "ValidationError" || error.name === "CastError")
    error.statusCode = 400;
  if (error.code === 11000) {
    error.statusCode = 409;
    error.message = "Email or username is already in use";
  }
  if (
    [
      "MongoServerSelectionError",
      "MongoNetworkError",
      "MongoOperationTimeoutError",
    ].includes(error.name)
  ) {
    error.statusCode = 503;
    error.code = "DEPENDENCY_UNAVAILABLE";
  }
  if (!error.statusCode && !error.status)
    process.stderr.write(
      JSON.stringify({
        level: "error",
        event: "request_failed",
        requestId: req.id,
      }) + "\n",
    );
  // console.log("errorHandler middleware called", { path: req.path, type: error.type });

  if (error.type === "entity.too.large") {
    res.status(413).json({ message: "Request body is too large" });
    return;
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    res.status(400).json({ message: "Request body contains invalid JSON" });
    return;
  }

  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode < 500 ? error.message : "Internal server error";
  // console.log("errorHandler middleware return", { path: req.path, statusCode });
  res.status(statusCode).json({
    message,
    code: typeof error.code === "string" ? error.code : `HTTP_${statusCode}`,
  });
}

/**
 * Create a configured Express application without opening network listeners.
 *
 * @param {Object} [options] - Application configuration overrides.
 * @param {string} [options.bodyLimit] - Maximum JSON and form body size.
 * @param {string[]} [options.clientOrigins] - Allowed browser origins.
 * @param {boolean} [options.enableRateLimit] - Whether to enforce API request quotas.
 * @param {boolean} [options.isProduction] - Whether to serve the compiled client.
 * @param {function(string): (Object|undefined)} [options.rateLimitStoreFactory] - Optional shared-store factory.
 * @param {boolean|number|string} [options.trustProxy] - Express trust-proxy setting.
 * @returns {Object} Configured Express application.
 */
function createApp({
  bodyLimit = process.env.REQUEST_BODY_LIMIT || "100kb",
  clientOrigins = parseClientOrigins(process.env.CLIENT_ORIGINS),
  enableRateLimit = process.env.NODE_ENV !== "test",
  isProduction = process.env.NODE_ENV === "production",
  rateLimitStoreFactory,
  trustProxy = process.env.TRUST_PROXY || false,
  lifecycle = { draining: false },
  isReady = async () => mongoose.connection.readyState === 1,
  config = loadRuntimeConfig(),
} = {}) {
  // console.log("createApp function called", { isProduction, enableRateLimit });
  const app = express();
  app.locals.userService = createUserService({ config });
  app.use((req, res, next) => {
    req.id = randomUUID();
    res.set("X-Request-Id", req.id);
    const json = res.json.bind(res);
    res.json = (body) =>
      json(
        res.statusCode >= 400 && body && typeof body === "object"
          ? {
              ...body,
              code: body.code || `HTTP_${res.statusCode}`,
              requestId: req.id,
            }
          : body,
      );
    next();
  });

  app.disable("x-powered-by");
  if (trustProxy) {
    app.set("trust proxy", trustProxy === "true" ? 1 : trustProxy);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: createOriginValidator(clientOrigins),
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: bodyLimit }));
  app.use(cookieParser());
  app.use("/api", (req, res, next) => {
    // console.log("API request middleware called", { method: req.method, path: req.path });
    res.set("Cache-Control", "no-store");
    next();
  });

  app.get("/api/health/live", (req, res) => res.json({ status: "ok" }));
  app.get(["/api/health", "/api/health/ready"], async (req, res) => {
    let ready = false;
    try {
      ready = !lifecycle.draining && (await isReady());
    } catch {
      /* Unavailable infrastructure is never reported as ready. */
    }
    res
      .status(ready ? 200 : 503)
      .json({ status: ready ? "ok" : "unavailable" });
  });
  app.use("/api", async (req, res, next) => {
    if (lifecycle.draining)
      return res
        .status(503)
        .json({ message: "Application is draining", code: "DRAINING" });
    next();
  });

  if (enableRateLimit) {
    const apiRateLimitStore = rateLimitStoreFactory?.("api");
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { message: "Too many requests; please try again later" },
        ...(apiRateLimitStore ? { store: apiRateLimitStore } : {}),
      }),
    );
  }

  const authRateLimitStore = enableRateLimit
    ? rateLimitStoreFactory?.("auth")
    : undefined;
  app.use(
    createRoutes({
      userController: createUserController({
        config,
        service: app.locals.userService,
      }),
      authRateLimitStore,
      enableRateLimit,
    }),
  );
  app.use("/api", (req, res) => {
    // console.log("API not-found handler called", { method: req.method, path: req.path });
    res.status(404).json({ message: "API route not found" });
  });

  if (isProduction) {
    const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
    const routeManifest = JSON.parse(
      fs.readFileSync(
        path.join(clientDistPath, "routes-manifest.json"),
        "utf8",
      ),
    );
    app.use(
      "/assets",
      express.static(path.join(clientDistPath, "assets"), {
        immutable: true,
        maxAge: "1y",
        fallthrough: false,
      }),
    );
    app.get("/{*path}", (req, res, next) => {
      const route = routeManifest.find((entry) => entry.path === req.path);
      if (!route) return next();
      res.set("Cache-Control", "no-cache");
      if (!route.indexable) res.set("X-Robots-Tag", "noindex, follow");
      res.sendFile(
        path.join(
          clientDistPath,
          route.path === "/"
            ? "index.html"
            : `${route.path.slice(1)}/index.html`,
        ),
      );
    });
    app.use(
      express.static(clientDistPath, {
        index: false,
        redirect: false,
        dotfiles: "deny",
        setHeaders(res, file) {
          res.set("Cache-Control", "no-cache");
          if (file.endsWith(".html"))
            res.set("X-Robots-Tag", "noindex, follow");
        },
      }),
    );
    app.get("/{*path}", (req, res) => {
      res.set("X-Robots-Tag", "noindex, follow");
      res.status(404).sendFile(path.join(clientDistPath, "404.html"));
    });
  } else {
    app.get("/", (req, res) => {
      // console.log("development health endpoint called", { path: req.path });
      res.json({ status: "ok" });
    });
  }

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
  app.use(errorHandler);

  // console.log("createApp function return", { configured: true });
  return app;
}

module.exports = {
  createApp,
  createOriginValidator,
  errorHandler,
  parseClientOrigins,
};
