/**
 * @module app/config/runtime
 * @description Runtime environment validation for database, HTTP, and authentication settings.
 */

const MINIMUM_SECRET_LENGTH = 32;
const DEVELOPMENT_DEFAULTS = Object.freeze({
  jwtAccessSecret: "development-only-access-secret-never-use-in-production",
  jwtRefreshSecret: "development-only-refresh-secret-never-use-in-production",
});
const DEFAULT_REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Read and validate a required signing secret.
 *
 * @param {Record<string, string|undefined>} environment - Environment mapping.
 * @param {string} name - Environment key.
 * @param {string|undefined} developmentDefault - Starter value allowed outside production.
 * @param {string} nodeEnv - Current runtime environment.
 * @returns {string} Validated secret.
 * @throws {Error} When the secret is missing or too short.
 */
function readSecret(environment, name, developmentDefault, nodeEnv) {
  const secret = environment[name] || developmentDefault;

  if (!secret) {
    throw new Error(`${name} is required in production`);
  }

  if (
    nodeEnv === "production" &&
    Object.values(DEVELOPMENT_DEFAULTS).includes(secret)
  ) {
    throw new Error(`${name} must not use the development default`);
  }

  if (secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(
      `${name} must be at least ${MINIMUM_SECRET_LENGTH} characters`,
    );
  }

  if (/replace[-_ ]with|change[-_ ]?me|example[-_ ]secret/iu.test(secret)) {
    throw new Error(`${name} must not use an example placeholder`);
  }

  return secret;
}

/**
 * Parse a bounded integer environment value.
 *
 * @param {string|undefined} value - Raw numeric value.
 * @param {number} fallback - Default value.
 * @param {number} minimum - Minimum accepted value.
 * @param {number} maximum - Maximum accepted value.
 * @returns {number} Bounded integer.
 */
function parseInteger(value, fallback, minimum, maximum) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (
    !/^\d+$/u.test(String(value)) ||
    !Number.isSafeInteger(parsed) ||
    parsed < minimum ||
    parsed > maximum
  ) {
    throw new Error(
      `Numeric configuration must be an integer between ${minimum} and ${maximum}`,
    );
  }
  return parsed;
}

/**
 * Normalize the Express trust-proxy setting.
 *
 * @param {string|undefined} value - Raw environment value.
 * @returns {boolean|number|string} Express-compatible proxy value.
 */
function parseTrustProxy(value) {
  if (!value || value === "false") {
    return false;
  }
  if (value === "true") {
    return 1;
  }

  if (/^\d+$/u.test(value)) return parseInteger(value, 0, 0, 32);
  if (
    value
      .split(",")
      .every((entry) =>
        /^(loopback|linklocal|uniquelocal)$/u.test(entry.trim()),
      )
  )
    return value;
  throw new Error(
    "TRUST_PROXY must be false, a bounded hop count, or a named Express subnet",
  );
}

/**
 * Apply normalized settings consumed by authentication and hashing modules.
 *
 * @param {ReturnType<loadRuntimeConfig>} config - Validated runtime settings.
 * @param {Record<string, string|undefined>} [environment] - Mutable environment mapping.
 * @returns {void}
 */
function applyRuntimeConfig(config, environment = process.env) {
  Object.assign(environment, {
    ACCESS_TOKEN_EXPIRES_IN: config.accessTokenExpiresIn,
    BCRYPT_ROUNDS: String(config.bcryptRounds),
    JWT_ACCESS_SECRET: config.jwtAccessSecret,
    JWT_AUDIENCE: config.jwtAudience,
    JWT_ISSUER: config.jwtIssuer,
    JWT_REFRESH_SECRET: config.jwtRefreshSecret,
    NODE_ENV: config.nodeEnv,
    REFRESH_COOKIE_MAX_AGE_MS: String(config.refreshCookieMaxAgeMs),
    REFRESH_TOKEN_EXPIRES_IN: config.refreshTokenExpiresIn,
  });
}

/**
 * Validate and normalize runtime configuration.
 *
 * @param {Record<string, string|undefined>} [environment] - Environment mapping to read.
 * @returns {{accessTokenExpiresIn: string, bodyLimit: string, bcryptRounds: number, clientOrigins: string[], deploymentMode: string, mongoMaxPoolSize: number, dependencyTimeoutMs: number, queryTimeoutMs: number, redisCommandTimeoutMs: number, requestTimeoutMs: number, headersTimeoutMs: number, shutdownTimeoutMs: number, jwtAccessSecret: string, jwtAudience: string, jwtIssuer: string, jwtRefreshSecret: string, mongodbUri: string, nodeEnv: string, port: number, rateLimitRedisPrefix: string, rateLimitRedisUrl: string|undefined, rateLimitStore: string, refreshCookieMaxAgeMs: number, refreshTokenExpiresIn: string, trustProxy: boolean|number|string}} Validated startup settings; timeout values use milliseconds.
 * @throws {Error} When required security or production settings are invalid.
 */
function loadRuntimeConfig(environment = process.env) {
  for (const key of [
    "NODE_ENV",
    "DEPLOYMENT_MODE",
    "PORT",
    "MONGODB_URI",
    "CLIENT_ORIGINS",
    "TRUST_PROXY",
    "REQUEST_BODY_LIMIT",
    "RATE_LIMIT_STORE",
    "RATE_LIMIT_REDIS_URL",
    "RATE_LIMIT_REDIS_PREFIX",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_ISSUER",
    "JWT_AUDIENCE",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
  ]) {
    if (environment[key] !== undefined && !String(environment[key]).trim())
      throw new Error(
        `${key} must not be empty; omit it to use a development default`,
      );
  }
  const nodeEnv = environment.NODE_ENV || "development";
  if (!["development", "test", "production"].includes(nodeEnv))
    throw new Error("NODE_ENV must be development, test, or production");
  const useDevelopmentDefaults = nodeEnv !== "production";
  const jwtAccessSecret = readSecret(
    environment,
    "JWT_ACCESS_SECRET",
    useDevelopmentDefaults ? DEVELOPMENT_DEFAULTS.jwtAccessSecret : undefined,
    nodeEnv,
  );
  const jwtRefreshSecret = readSecret(
    environment,
    "JWT_REFRESH_SECRET",
    useDevelopmentDefaults ? DEVELOPMENT_DEFAULTS.jwtRefreshSecret : undefined,
    nodeEnv,
  );

  if (jwtAccessSecret === jwtRefreshSecret) {
    throw new Error("JWT access and refresh secrets must be different");
  }

  if (nodeEnv === "production" && !environment.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in production");
  }

  const rateLimitStore = (environment.RATE_LIMIT_STORE || "memory")
    .trim()
    .toLowerCase();
  if (!new Set(["memory", "redis"]).has(rateLimitStore)) {
    throw new Error("RATE_LIMIT_STORE must be memory or redis");
  }

  const rateLimitRedisUrl =
    environment.RATE_LIMIT_REDIS_URL?.trim() ||
    (nodeEnv === "production" ? undefined : "redis://localhost:6379");
  if (rateLimitStore === "redis" && !rateLimitRedisUrl) {
    throw new Error(
      "RATE_LIMIT_REDIS_URL is required when RATE_LIMIT_STORE is redis",
    );
  }
  if (rateLimitRedisUrl) {
    let protocol;
    try {
      const redisUrl = new URL(rateLimitRedisUrl);
      protocol = redisUrl.hostname ? redisUrl.protocol : undefined;
    } catch {
      protocol = undefined;
    }
    if (protocol !== "redis:" && protocol !== "rediss:") {
      throw new Error("RATE_LIMIT_REDIS_URL must use redis:// or rediss://");
    }
  }

  const deploymentMode =
    environment.DEPLOYMENT_MODE ||
    (useDevelopmentDefaults ? "single" : undefined);
  if (!["single", "multi"].includes(deploymentMode))
    throw new Error(
      "DEPLOYMENT_MODE must explicitly be single or multi in production",
    );
  if (deploymentMode === "multi" && rateLimitStore !== "redis")
    throw new Error(
      "Multi-instance deployment requires RATE_LIMIT_STORE=redis",
    );
  const mongodbUri =
    environment.MONGODB_URI || "mongodb://localhost/mern_app-template-withauth";
  if (!/^mongodb(?:\+srv)?:\/\/[^/?#\s]+(?:\/[^\s]*)?$/u.test(mongodbUri))
    throw new Error("MONGODB_URI must use mongodb:// or mongodb+srv://");
  const clientOrigins = (environment.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
  for (const origin of clientOrigins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("CLIENT_ORIGINS must contain HTTP origins");
    }
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password
    )
      throw new Error(
        "CLIENT_ORIGINS must contain origins without paths or credentials",
      );
  }
  for (const key of ["ACCESS_TOKEN_EXPIRES_IN", "REFRESH_TOKEN_EXPIRES_IN"]) {
    if (
      environment[key] !== undefined &&
      !/^[1-9]\d*(?:s|m|h|d)$/u.test(environment[key])
    )
      throw new Error(
        `${key} must be a positive duration with s, m, h, or d units`,
      );
    if (environment[key] !== undefined) {
      const duration = environment[key];
      const seconds =
        Number(duration.slice(0, -1)) *
        { s: 1, m: 60, h: 3600, d: 86400 }[duration.at(-1)];
      if (!Number.isSafeInteger(seconds) || seconds > 365 * 86400)
        throw new Error(`${key} must not exceed 365 days`);
    }
  }
  if (
    environment.REQUEST_BODY_LIMIT !== undefined &&
    !/^[1-9]\d*(?:b|kb|mb)$/iu.test(environment.REQUEST_BODY_LIMIT)
  )
    throw new Error("REQUEST_BODY_LIMIT must be a positive byte size");

  return {
    accessTokenExpiresIn: environment.ACCESS_TOKEN_EXPIRES_IN || "15m",
    bodyLimit: environment.REQUEST_BODY_LIMIT || "100kb",
    bcryptRounds: parseInteger(environment.BCRYPT_ROUNDS, 12, 10, 15),
    clientOrigins,
    deploymentMode,
    mongoMaxPoolSize: parseInteger(environment.MONGO_MAX_POOL_SIZE, 10, 1, 500),
    dependencyTimeoutMs: parseInteger(
      environment.DEPENDENCY_TIMEOUT_MS,
      5000,
      100,
      60000,
    ),
    queryTimeoutMs: parseInteger(
      environment.QUERY_TIMEOUT_MS,
      5000,
      100,
      60000,
    ),
    redisCommandTimeoutMs: parseInteger(
      environment.REDIS_COMMAND_TIMEOUT_MS,
      2000,
      100,
      30000,
    ),
    requestTimeoutMs: parseInteger(
      environment.HTTP_REQUEST_TIMEOUT_MS,
      30000,
      1000,
      120000,
    ),
    headersTimeoutMs: parseInteger(
      environment.HTTP_HEADERS_TIMEOUT_MS,
      15000,
      1000,
      60000,
    ),
    shutdownTimeoutMs: parseInteger(
      environment.SHUTDOWN_TIMEOUT_MS,
      15000,
      100,
      60000,
    ),
    jwtAccessSecret,
    jwtAudience: environment.JWT_AUDIENCE || "mern-app-client",
    jwtIssuer: environment.JWT_ISSUER || "mern-app-template",
    jwtRefreshSecret,
    mongodbUri,
    nodeEnv,
    port: parseInteger(environment.PORT, 3001, 1, 65535),
    rateLimitRedisPrefix:
      environment.RATE_LIMIT_REDIS_PREFIX?.trim() ||
      `mern-app-template-${nodeEnv}-rate-limit`,
    rateLimitRedisUrl,
    rateLimitStore,
    refreshCookieMaxAgeMs: parseInteger(
      environment.REFRESH_COOKIE_MAX_AGE_MS,
      DEFAULT_REFRESH_COOKIE_MAX_AGE_MS,
      1,
      Number.MAX_SAFE_INTEGER,
    ),
    refreshTokenExpiresIn: environment.REFRESH_TOKEN_EXPIRES_IN || "7d",
    trustProxy: parseTrustProxy(environment.TRUST_PROXY),
  };
}

module.exports = {
  applyRuntimeConfig,
  loadRuntimeConfig,
  parseInteger,
  parseTrustProxy,
};
