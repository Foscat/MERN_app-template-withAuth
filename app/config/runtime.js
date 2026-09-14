/**
 * @module app/config/runtime
 * @description Runtime environment validation for database, HTTP, and authentication settings.
 */

const MINIMUM_SECRET_LENGTH = 32;

/**
 * Read and validate a required signing secret.
 *
 * @param {Record<string, string|undefined>} environment - Environment mapping.
 * @param {string} name - Environment key.
 * @returns {string} Validated secret.
 * @throws {Error} When the secret is missing or too short.
 */
function readSecret(environment, name) {
  const secret = environment[name];

  if (!secret) {
    throw new Error(`${name} is required`);
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
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, minimum), maximum);
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

  const numericValue = Number.parseInt(value, 10);
  return Number.isInteger(numericValue) ? numericValue : value;
}

/**
 * Validate and normalize runtime configuration.
 *
 * @param {Record<string, string|undefined>} [environment] - Environment mapping to read.
 * @returns {{accessTokenExpiresIn: string, bodyLimit: string, bcryptRounds: number, clientOrigins: string[], jwtAccessSecret: string, jwtAudience: string, jwtIssuer: string, jwtRefreshSecret: string, mongodbUri: string, nodeEnv: string, port: number, refreshTokenExpiresIn: string, trustProxy: boolean|number|string}} Runtime settings.
 * @throws {Error} When required security or production settings are invalid.
 */
function loadRuntimeConfig(environment = process.env) {
  const jwtAccessSecret = readSecret(environment, "JWT_ACCESS_SECRET");
  const jwtRefreshSecret = readSecret(environment, "JWT_REFRESH_SECRET");

  if (jwtAccessSecret === jwtRefreshSecret) {
    throw new Error("JWT access and refresh secrets must be different");
  }

  const nodeEnv = environment.NODE_ENV || "development";
  if (nodeEnv === "production" && !environment.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in production");
  }

  return {
    accessTokenExpiresIn: environment.ACCESS_TOKEN_EXPIRES_IN || "15m",
    bodyLimit: environment.REQUEST_BODY_LIMIT || "100kb",
    bcryptRounds: parseInteger(environment.BCRYPT_ROUNDS, 12, 10, 15),
    clientOrigins: (environment.CLIENT_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    jwtAccessSecret,
    jwtAudience: environment.JWT_AUDIENCE || "mern-app-client",
    jwtIssuer: environment.JWT_ISSUER || "mern-app-template",
    jwtRefreshSecret,
    mongodbUri:
      environment.MONGODB_URI ||
      "mongodb://localhost/mern_app-template-withauth",
    nodeEnv,
    port: parseInteger(environment.PORT, 3001, 1, 65535),
    refreshTokenExpiresIn: environment.REFRESH_TOKEN_EXPIRES_IN || "7d",
    trustProxy: parseTrustProxy(environment.TRUST_PROXY),
  };
}

module.exports = { loadRuntimeConfig, parseInteger, parseTrustProxy };
