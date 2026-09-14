/**
 * @module app/create-app
 * @description Express application factory with security, parsing, CORS, and error boundaries.
 */

const path = require("node:path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const routes = require("./routes");

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
  void next;
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
  res.status(statusCode).json({ message });
}

/**
 * Create a configured Express application without opening network listeners.
 *
 * @param {Object} [options] - Application configuration overrides.
 * @param {string} [options.bodyLimit] - Maximum JSON and form body size.
 * @param {string[]} [options.clientOrigins] - Allowed browser origins.
 * @param {boolean} [options.enableRateLimit] - Whether to enforce API request quotas.
 * @param {boolean} [options.isProduction] - Whether to serve the compiled client.
 * @param {boolean|number|string} [options.trustProxy] - Express trust-proxy setting.
 * @returns {Object} Configured Express application.
 */
function createApp({
  bodyLimit = process.env.REQUEST_BODY_LIMIT || "100kb",
  clientOrigins = parseClientOrigins(process.env.CLIENT_ORIGINS),
  enableRateLimit = process.env.NODE_ENV !== "test",
  isProduction = process.env.NODE_ENV === "production",
  trustProxy = process.env.TRUST_PROXY || false,
} = {}) {
  // console.log("createApp function called", { isProduction, enableRateLimit });
  const app = express();

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

  if (enableRateLimit) {
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { message: "Too many requests; please try again later" },
      }),
    );
  }

  app.get("/api/health", (req, res) => {
    // console.log("health API handler called", { path: req.path });
    // console.log("health API handler return", { status: "ok" });
    res.json({ status: "ok" });
  });
  app.use(routes);
  app.use("/api", (req, res) => {
    // console.log("API not-found handler called", { method: req.method, path: req.path });
    res.status(404).json({ message: "API route not found" });
  });

  if (isProduction) {
    const clientDistPath = path.join(__dirname, "..", "client", "dist");
    app.use(express.static(clientDistPath));
    app.get("/{*path}", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
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
